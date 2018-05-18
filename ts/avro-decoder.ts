// import Avro = require("avsc");
import * as Avro from "avsc";
import { optionsDefault, ACCEPT_HEADERS, decodeLogger } from "./config";
import { handleError, aggregateOptions } from "./util";
import { Options, DecoderTopicInfo, DecodeFunc } from "./types/types";
import * as rp from "request-promise";

/**
 * Retrieve the AVRO schema from the schema registry. On a
 * retrieable error, retry up to the configure number of times
 *
 * @param id - the schema id that should be retrieved
 * @return - The AVRO schema requested
 */
const genSchemaRetriever = ({
  subject,
  schemaRegistry,
  numRetries
}: Options) => async (id: number): Promise<any> => {
  const req = {
    uri: `${schemaRegistry}/schemas/ids/${id}`,
    headers: [{ Accept: ACCEPT_HEADERS }],
    json: true,
    resolveWithFullResponse: true
  };

  let schema: any;
  let error = null;

  // implement retry on certain status/reason codes
  for (let i = 0; i <= numRetries; i += 1) {
    try {
      schema = JSON.parse((await rp(req)).body.schema);

      // make sure to clear any previous errors
      error = null;
      break;
    } catch (err) {
      // save the error
      error = err;

      // see if it can be retried
      const retry: boolean = handleError(err, decodeLogger, "get schema");

      if (retry && i + 1 <= numRetries) {
        // try and try again until we run out of retries
        continue;
      }

      // fatal error
      break;
    }
  }

  if (error) {
    decodeLogger.error(
      `Failed to retrieve schema for subject ${subject} with id ${id}`,
      error,
      { subject, id }
    );

    throw new Error(
      `Failed to retrieve schema for subject ${subject} with id ${id}`
    );
  }

  return schema;
};

/**
 * Retrieve the AVRO schema from the schema registry, parse it,
 * and create a resolver to the local AVRO schema.
 *
 * @param subject - The subject under which the schema is registered
 * @param id - the schema id that should be the source for the
 *             schema resolver
 * @param avroSchema - the target AVRO schema for the resolver
 * @return - The AVRO schema resolver used to convert messages
 *           encoded with the specified AVRO schema to the local
 *           AVRO schema format
 */
const genCreateSchemaResolver = ({
  subject,
  retrieveSchema
}: DecoderTopicInfo) => async (
  id: number,
  schema: Avro.Type
): Promise<Avro.Resolver> => {
  /**
   * Retrieve the schema by ID from the schema registry ...
   */
  const msgSchema = await retrieveSchema(id);
  decodeLogger.info("Retrieved schema", { id, subject });

  /**
   * ... parse the schema ...
   */
  const avSourceSchema = Avro.Type.forSchema(msgSchema);

  /**
   * ... and create a resolver to the schema we know how to consume
   */
  decodeLogger.info("Created resolver", { id, subject });

  try {
    return schema.createResolver(avSourceSchema);
  } catch (error) {
    throw new Error("Incompatible schemas");
  }
};

const genGetSchemaResolver = ({
  subject,
  resolversMap,
  createSchemaResolver
}: DecoderTopicInfo) => async (
  encoded: Buffer | null,
  schema: Avro.Type | null
): Promise<Avro.Resolver> => {
  // Do not attempt to get a resolver
  if (!schema) {
    return null;
  }

  if (!encoded) {
    return null;
  }

  /**
   * Extract the schema id with which the buffer was encoded
   */
  const id: number = encoded.slice(1, 5).readInt32BE(0);

  if (!resolversMap[id]) {
    decodeLogger.info("Did not find resolver", { id, subject });

    /**
     * We do not have a resolver from the source schema to the
     * schema we support. Go and get a resolver.
     *
     * IMPORTANT
     *
     * We store a promise of a resolver in our hashmap. The reason is that
     * if we have multipe messages beig handled asynchronously, we do not
     * want all of them to flood the schema registry with REST calls
     * to retrieve the schema
     */
    resolversMap[id] = createSchemaResolver(id, schema);
    decodeLogger.info("Retrieving resolver", { id, subject });
  }

  return resolversMap[id];
};

const decodePayload = async (
  encoded: Buffer | null,
  schema: Avro.Type | null,
  resolver: Promise<Avro.Resolver>
): Promise<Buffer> => {
  // Do not attempt to avro decode if we have no target schema specified
  if (!schema) {
    return encoded;
  }

  // Do not attempt to avro decode null value
  if (!encoded) {
    return encoded;
  }

  return schema.decode(encoded.slice(5), 0, await resolver).value;
};

const genMessageDecoder = ({
  schema,
  getSchemaResolver
}: DecoderTopicInfo): DecodeFunc => async (buffer: Buffer): Promise<Object> => {
  return await decodePayload(
    buffer,
    schema,
    await getSchemaResolver(buffer, schema)
  );
};

/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/

export const createDecoder = ({
  schemaRegistry,
  numRetries,
  wrapUnions,
  subject,
  schema
}: Options): DecodeFunc => {
  // Aggregare the configuration values with defaults
  const mergedOptions: Options = aggregateOptions(optionsDefault, {
    schemaRegistry,
    numRetries,
    wrapUnions,
    subject,
    schema
  });

  // topic info
  const topicInfo: DecoderTopicInfo = {
    subject: subject,
    schema: schema ? Avro.Type.forSchema(schema) : null,
    resolversMap: {},
    retrieveSchema: null,
    createSchemaResolver: null,
    getSchemaResolver: null
  };

  topicInfo.retrieveSchema = genSchemaRetriever(mergedOptions);
  topicInfo.createSchemaResolver = genCreateSchemaResolver(topicInfo);
  topicInfo.getSchemaResolver = genGetSchemaResolver(topicInfo);

  return genMessageDecoder(topicInfo);
};

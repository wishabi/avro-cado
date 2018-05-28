import * as Avro from "avsc";
import * as rp from "request-promise";
import { processOptions, ACCEPT_HEADERS } from "./config";
import { handleError, aggregateOptions } from "./util";
import { DecoderInfo, DecodeFunc, Options } from "./types/types";

/**
 * Retrieve the Avro schema from the schema registry. On an error
 * eligible for retry, try up to the configure number of times
 *
 * @param id - the schema id that should be retrieved
 * @return - The Avro schema requested
 */
const genSchemaRetriever = ({
  subject,
  schemaRegistry,
  numRetries
}: Options) => async (id: number): Promise<object> => {
  const req = {
    uri: `${schemaRegistry}/schemas/ids/${id}`,
    headers: [{ Accept: ACCEPT_HEADERS }],
    json: true,
    resolveWithFullResponse: true
  };

  let schema: object;
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

      if (!handleError(err)) {
        break;
      }
    }
  }

  if (error) {
    throw new Error(
      `Failed to retrieve schema for subject ${subject} with id ${id} :: ${
        error.message
      }`
    );
  }

  return schema;
};

/**
 * Retrieve the Avro schema from the schema registry, parse it,
 * and create a resolver to the local Avro schema.
 *
 * @param subject - The subject under which the schema is registered
 * @param id - the schema id that should be the source for the
 *             schema resolver
 * @param schema - the target Avro schema for the resolver
 * @return - The Avro schema resolver used to convert messages
 *           encoded with the specified Avro schema to the local
 *           Avro schema format
 */
const genCreateSchemaResolver = ({
  subject,
  retrieveSchema
}: DecoderInfo) => async (
  id: number,
  schema: Avro.Type
): Promise<Avro.Resolver> => {
  /**
   * Retrieve the schema by ID from the schema registry ...
   */
  const msgSchema = await retrieveSchema(id);

  /**
   * ... parse the schema ...
   */
  const avSourceSchema = Avro.Type.forSchema(msgSchema);

  /**
   * ... and create a resolver to the schema we know how to consume
   */
  return schema.createResolver(avSourceSchema);
};

/**
 * Create and return an Avro schema resolver, if one doesn't already
 * exist for the schema id in the encoded message to the schema passed
 * in
 *
 * @param encoded - The Avro encoded buffer
 * @param schema - the target Avro schema for the resolver
 * @return - The promise that holds the Avro resolver
 */
const genGetSchemaResolver = ({
  subject,
  resolversMap,
  createSchemaResolver
}: DecoderInfo) => async (
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
    /**
     * We do not have a resolver from the source schema to the
     * schema we support. Go and get a resolver.
     *
     * IMPORTANT
     *
     * We store a promise of a resolver in our hashmap. The reason is that
     * if we have multiple messages being handled asynchronously, we do not
     * want all of them to flood the schema registry with REST calls
     * to retrieve the schema
     */
    resolversMap[id] = createSchemaResolver(id, schema);
  }

  return resolversMap[id];
};

/**
 * Avro decode the passed in data
 *
 * @param encoded - The Avro encoded buffer
 * @param schema - the target Avro schema to which the decoded payload
 *                 should conform
 * @param resolver - a promise for an Avro resolver that will
 *                   convert the data from the schema with which
 *                   it was encoded to the schema which we want to
 *                   read
 * @return - The promise that holds the Avro decoded payload
 */
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

/**
 * Create an Avro decoder based on the specified parameters and
 * return a closure that takes an encoded Buffer and decodes it
 *
 * @param schema - the target Avro schema to which the decoded payload
 *                 should conform
 * @param getSchemaResolver - a function used to retrieve the resolver
 *                            object that will be used to decode the payload
 * @param buffer - The Avro encoded buffer
 * @return - The Avro decoded object that conforms to the specified schema
 */
const genMessageDecoder = ({
  schema,
  getSchemaResolver
}: DecoderInfo): DecodeFunc => async (buffer: Buffer): Promise<Object> => {
  return await decodePayload(buffer, schema, getSchemaResolver(buffer, schema));
};

/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/

export const createDecoder = (opts: Options): DecodeFunc => {
  // Aggregate the configuration values with defaults
  const mergedOpts: Options = processOptions(opts);

  // decoder info
  const decoderInfo: DecoderInfo = {
    subject: mergedOpts.subject,
    schema: mergedOpts.schema ? Avro.Type.forSchema(mergedOpts.schema) : null,
    resolversMap: {},
    retrieveSchema: null,
    createSchemaResolver: null,
    getSchemaResolver: null
  };

  decoderInfo.retrieveSchema = genSchemaRetriever(mergedOpts);
  decoderInfo.createSchemaResolver = genCreateSchemaResolver(decoderInfo);
  decoderInfo.getSchemaResolver = genGetSchemaResolver(decoderInfo);

  return genMessageDecoder(decoderInfo);
};

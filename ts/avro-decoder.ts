import * as Avro from "avsc";
import * as rp from "request-promise";
import { ACCEPT_HEADERS, processOptions } from "./config";
import {
  DecodeFunc,
  DecoderInfo,
  Options,
  SchemaResolverFunc
} from "./types/types";
import { aggregateOptions, handleError } from "./util";

/**
 * Retrieve the Avro schema from the schema registry. On an error
 * eligible for retry, try up to the configure number of times
 *
 * @param subject - the subject under which the schema is registered
 * @param schemaRegistry - the schema registry path
 * @param numRetries - the number of retries
 * @param id - the schema id that should be retrieved
 * @return - The Avro schema requested
 */
export const retrieveSchema = async (
  { subject, schemaRegistry, numRetries }: Options,
  id: number
) => {
  const req = {
    uri: `${schemaRegistry}/schemas/ids/${id}`,
    headers: { Accept: ACCEPT_HEADERS },
    json: true,
    resolveWithFullResponse: true
  };

  let error = null;

  // implement retry on certain status/reason codes
  for (let i = 0; i <= numRetries; i += 1) {
    try {
      return JSON.parse((await rp(req)).body.schema);
    } catch (err) {
      // save the error
      error = err;

      if (!handleError(err)) {
        break;
      }
    }
  }

  throw new Error(
    `Failed to retrieve schema for subject ${subject} with id ${id} :: ${
      error.message
    }`
  );
};

/**
 * Retrieve the Avro schema from the schema registry, parse it,
 * and create a resolver to the local Avro schema.
 *
 * @param id - the schema id that should be the source for the
 *             schema resolver
 * @param schema - the target Avro schema for the resolver
 * @return - The Avro schema resolver used to convert messages
 *           encoded with the specified Avro schema to the local
 *           Avro schema format
 */
export const genCreateSchemaResolver = (
  opts: Options
): SchemaResolverFunc => async (
  id: number,
  schema: Avro.Type
): Promise<Avro.Resolver> => {
  /**
   * Retrieve the schema by ID from the schema registry ...
   */
  const msgSchema = await retrieveSchema(opts, id);

  /**
   * ... parse the schema ...
   */
  try {
    const avSourceSchema = Avro.Type.forSchema(msgSchema);

    /**
     * ... and create a resolver to the schema we know how to consume
     */
    return schema.createResolver(avSourceSchema);
  } catch (err) {
    throw new Error(
      `Local schema is not compatible with schema from registry with id ${id} :: ${
        err.message
      }`
    );
  }
};

/**
 * Create an Avro decoder based on the specified parameters and
 * return a closure that takes an encoded Buffer and decodes it
 *
 * @param schema - the target Avro schema to which the decoded payload
 *                 should conform
 * @param createSchemaResolver - a function used to create the resolver
 *                               object that will be used to decode the payload
 * @param resolversMap - a hashmap keys on the schema ids where the value is a
 *                       promise holding a schema resolver
 * @param buffer - The Avro encoded buffer
 * @return - The Avro decoded object that conforms to the specified schema
 */
export const genPayloadDecoder = ({
  schema,
  createSchemaResolver,
  resolversMap
}: DecoderInfo): DecodeFunc => async (
  buffer: Buffer | null
): Promise<object> => {
  // Do not attempt to avro decode null value
  if (!buffer) {
    return buffer;
  }

  /**
   * Extract the schema id with which the buffer was encoded
   */
  const id: number = buffer.slice(1, 5).readInt32BE(0);

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

  return schema.decode(buffer.slice(5), 0, await resolversMap[id]).value;
};

/*
 *****************************************************************
 *                      EXPORTED INTERFACE                       *
 *****************************************************************
 */

export const createDecoder = (opts: Options): DecodeFunc => {
  // Aggregate the configuration values with defaults
  const mergedOpts: Options = processOptions(opts);

  // decoder info
  const decoderInfo: DecoderInfo = {
    subject: mergedOpts.subject,
    schema: Avro.Type.forSchema(mergedOpts.schema),
    resolversMap: {},
    createSchemaResolver: null
  };

  decoderInfo.createSchemaResolver = genCreateSchemaResolver(mergedOpts);

  return genPayloadDecoder(decoderInfo);
};

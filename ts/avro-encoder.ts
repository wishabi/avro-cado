import * as rp from "request-promise";
import * as Avro from "avsc";
import { handleError } from "./util";
import { processOptions, ACCEPT_HEADERS } from "./config";
import { EncodeFunc, Options } from "./types/types";

/**
 * Register the specified schema for the specified topic under the
 * specified subject.
 *
 * On an error eligible for retry, keep trying up to the specified number
 * of times. Once all retries have been exhausted, any error is considered
 * a fatal one.
 *
 *
 * @param subject - the subject under which to register the schema
 * @param schemaRegistry - the schema registry host
 * @param numRetries - the number of retries to register before throwing an error
 * @param schema - the schema to register
 *
 * @return - A Promise holding the id of the schema in the schema registry
 */
export const registerSchema = async (opts: Options): Promise<number> => {
  // craft the REST call to the schema registry
  const req = {
    method: "POST",
    uri: `${opts.schemaRegistry}/subjects/${opts.subject}/versions`,
    headers: { Accept: ACCEPT_HEADERS },
    body: {
      schema: JSON.stringify(opts.schema)
    },
    json: true,
    resolveWithFullResponse: true
  };

  try {
    return (await rp(req)).body.id;
  } catch (err) {
    if (opts.numRetries === 0 || handleError(err) === false) {
      throw new Error(
        `Failed to register schema for subject ${opts.subject} :: ${
          err.message
        }`
      );
    }

    const o: Options = Object.assign({}, opts, {
      numRetries: opts.numRetries - 1
    });

    return registerSchema(o);
  }
};

/**
 * Create a function that takes a message JSON object
 * and Avro encodes it
 *
 * @param payload - the JSON object to Avro encode
 * @return - The Avro encoded object as a Buffer
 */
export const genMessageEncoder = (
  schema: Avro.Type,
  schemaId: number
): EncodeFunc => (payload: object): Buffer => {
  if (payload === null) {
    // no payload so return it
    return null;
  }

  // create the avro header
  const header = new Buffer(5);

  // magic byte
  header.writeInt8(0, 0);

  // schema id
  header.writeInt32BE(schemaId, 1);

  // Avro encode the payload
  const buffer: Buffer = schema.toBuffer(payload);

  return Buffer.concat([header, buffer]);
};

/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/

export const createEncoder = async (opts: Options): Promise<EncodeFunc> => {
  // Aggregate the configuration values with defaults
  const mergedOpts: Options = processOptions(opts);

  return genMessageEncoder(
    Avro.Type.forSchema(mergedOpts.schema, {
      wrapUnions: mergedOpts.wrapUnions
    }),
    await registerSchema(mergedOpts)
  );
};

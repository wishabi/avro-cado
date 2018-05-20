import { handleError } from "./util";
import { processOptions, ACCEPT_HEADERS } from "./config";
import { EncodeFunc } from "./types/types";
import * as rp from "request-promise";
import * as Avro from "avsc";

/**
 * Register the specified schema for the specified topic under the
 * specifed subject. The subject used is: <topic>-<key|value>
 *
 * @param subject - the subject under which to register the schema
 * @param schemaRegistry - the schema registry host
 * @param numRetries - the number of retries to register before throwing an error
 * @param schema - the schema to register
 *
 * @return - A Promise holding the id of the schema in the schema registry
 */
export const registerSchema = async ({
  subject,
  schemaRegistry,
  numRetries,
  schema
}): Promise<number> => {
  // craft the REST call to the schema registry
  const req = {
    method: "POST",
    uri: `${schemaRegistry}/subjects/${subject}/versions`,
    headers: { Accept: ACCEPT_HEADERS },
    body: {
      schema: JSON.stringify(schema)
    },
    json: true,
    resolveWithFullResponse: true
  };

  try {
    return (await rp(req)).body.id;
  } catch (err) {
    if (numRetries === 0 || handleError(err) === false) {
      throw new Error(
        `Failed to register schema for subject ${subject} :: ${err.message}`
      );
    }

    return registerSchema({
      subject,
      schemaRegistry,
      numRetries: numRetries - 1,
      schema
    });
  }
};

export const genMessageEncoder = (
  schema: Avro.Type,
  schemaId: number
): EncodeFunc => (message: object): Buffer => {
  if (message === null) {
    // no payload so return it
    return null;
  }

  let length: number = 1024;

  for (;;) {
    const buf: Buffer = new Buffer(length);
    buf[0] = 0; // magic byte
    buf.writeInt32BE(schemaId, 1);

    const pos: number = schema.encode(message, buf, 5);
    if (pos < 0) {
      // the buffer was too short, we need to resize
      length -= pos;
      continue;
    }

    return buf.slice(0, pos);
  }
};

/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/

export const createEncoder = async (opts): Promise<EncodeFunc> => {
  // Aggregare the configuration values with defaults
  const mergedOpts = processOptions(opts);

  return genMessageEncoder(
    Avro.Type.forSchema(mergedOpts.schema, {
      wrapUnions: mergedOpts.wrapUnions
    }),
    await registerSchema(mergedOpts)
  );
};

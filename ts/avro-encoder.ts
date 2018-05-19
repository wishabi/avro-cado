import { handleError, aggregateOptions } from "./util";
import { processOptions, ACCEPT_HEADERS, encodeLogger } from "./config";
import { EncoderInfo, EncodeFunc } from "./types/types";
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
  // null schema so nothing to register
  if (!schema) {
    return -1;
  }

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

  let schemaId: number;
  let error = null;

  // implement retry on certain status/reason codes
  for (let i = 0; i <= numRetries; i += 1) {
    try {
      schemaId = (await rp(req)).body.id;

      // make sure to clear any previous errors
      error = null;
      break;
    } catch (err) {
      // save the error
      error = err;

      // see if it can be retried
      const retry: boolean = handleError(err, encodeLogger, "register schema");

      if (retry && i + 1 <= numRetries) {
        // try and try again until we run out of retries
        continue;
      }

      // fatal error
      break;
    }
  }

  if (error) {
    encodeLogger.error(`Registering schema for ${subject}  failed`, error, {
      subject,
      schema
    });

    throw new Error(`Failed to register schema for subject ${subject}`);
  }

  encodeLogger.info(`Registered schema for subject ${subject}`, {
    schemaId,
    subject
  });

  return schemaId;
};

/**
 * @todo Fix doc comment
 * Encode an Avro value into a message, as expected by Confluent's Kafka Avro
 * deserializer.
 *
 * @param message - message to encode
 */
export const encodeData = (
  payload: object | null,
  schemaId: number,
  schema: Avro.Type,
  length: number = 1024
): Buffer => {
  if (payload === null) {
    // no payload so return it
    return null;
  }

  if (schemaId === -1) {
    // Bufferify the payload
    return Buffer.from(JSON.stringify(payload));
  }

  const buf: Buffer = new Buffer(length);
  buf[0] = 0; // magic byte
  buf.writeInt32BE(schemaId, 1);

  const pos: number = schema.encode(payload, buf, 5);
  if (pos < 0) {
    // the buffer was too short, we need to resize
    return encodeData(payload, schemaId, schema, length - pos);
  }
  return buf.slice(0, pos);
};

const genMessageEncoder = ({ schema, schemaId }: EncoderInfo): EncodeFunc => (
  message: object
): Buffer => {
  return encodeData(message, schemaId, schema);
};

const createAvroSchema = ({ wrapUnions, schema }): Avro.Type | null => {
  if (schema) {
    return Avro.Type.forSchema(schema, { wrapUnions });
  }

  return null;
};

/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/

export const createEncoder = async (opts): Promise<EncodeFunc> => {
  // Aggregare the configuration values with defaults
  const mergedOpts = processOptions(opts);

  // encoder info
  const encoderInfo: EncoderInfo = {
    schema: null,
    schemaId: -1
  };

  // register the value and key schemas and parse them
  [encoderInfo.schema, encoderInfo.schemaId] = await Promise.all([
    createAvroSchema(mergedOpts),
    registerSchema(mergedOpts)
  ]);

  return genMessageEncoder(encoderInfo);
};

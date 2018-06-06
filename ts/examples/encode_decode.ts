import { createDecoder } from "../avro-decoder";
import { createEncoder } from "../avro-encoder";

const avroSchema = {
  type: "record",
  name: "TestMessage",
  namespace: "com.flipp.node.kafka.TestMessage",
  doc: "Properties related to a TestMessage.",
  fields: [
    {
      name: "key",
      type: "string",
      doc: "The the key for the message"
    },
    {
      name: "text",
      type: "string",
      doc: "The text for the message"
    }
  ]
};

const message = {
  key: `1`,
  text: `A simple test message 1`
};

const encodeDecode = async () => {
  const opts = {
    schemaRegistry: "http://localhost:8081",
    numRetries: 10,
    subject: "test-value",
    schema: avroSchema
  };

  /*
   *****************************************************************
   *                                                 encoder example
   *****************************************************************
   */

  console.log(`Before encoder:               ${JSON.stringify(message)}`);

  // create the encoder
  const encodeFunc = await createEncoder(opts);

  // encode a message
  const encoded: Buffer = encodeFunc(message);

  console.log(`After encoder before decoder: ${encoded.toString("hex")}`);

  /*
   *****************************************************************
   *                                                 decoder example
   *****************************************************************
   */

  // create a decoder
  const decodeFunc = createDecoder(opts);

  // decode a message
  const decoded = await decodeFunc(encoded);

  console.log(`After decoder:                ${JSON.stringify(decoded)}`);
};

(async () => {
  await encodeDecode();
})();

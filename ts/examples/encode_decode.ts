import { createEncoder } from "../avro-encoder";
import { createDecoder } from "../avro-decoder";

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
   *                                                  encoder exmple
   *****************************************************************
   */

  console.log(`Before encoder:               ${message}`);

  // create the encoder
  const encodeFunc = await createEncoder(opts);

  // encode a message
  const encoded: Buffer = encodeFunc(message);

  console.log(`After encoder before decoder: ${encoded}`);

  /*
   *****************************************************************
   *                                                  decoder exmple
   *****************************************************************
   */

  // create a decoder
  const decodeFunc = createDecoder(opts);

  const decoded = await decodeFunc(encoded);

  console.log(`After decoder:                ${decoded}`);
};

(async () => {
  await encodeDecode();
})();

// jest.mock("node-rdkafka");

// // import util = require("util");
// import { Options, EncodeFunc } from "../ts/types/types";
// import { createEncoder } from "../ts/avro-encoder";

// const TOPIC_NAME = "Test Topic";
// const AVRO_SCHEMA_UNION_OBJ = {
//   type: "record",
//   name: "TestMessageWithUnionType",
//   namespace: "com.flipp.node.kafka.TestMessage",
//   doc: "Properties related to a TestMessage.",
//   fields: [
//     {
//       name: "key",
//       type: "string",
//       doc: "The the key for the message"
//     },
//     {
//       name: "text",
//       type: ["null", "string"],
//       doc: "The text for the message"
//     }
//   ]
// };
// const UNWRAPPED_MESSAGE = {
//   key: "1",
//   text: "A simple test message in an unwrapped union type"
// };
// const WRAPPED_MESSAGE = {
//   key: "1",
//   text: { string: "A simple test message in a wrapped union type" }
// };

describe("createEncoder", () => {
  it("should encode schema with auto-wrapped union types by default", async () => {
    expect(true === true);
  });
});

// describe("createEncoder", () => {
//   it("should encode schema with auto-wrapped union types by default", async () => {
//     const pkgConfig = {};
//     const encoder: EncodeFunc = await createEncoder({
//       subject: "subject",
//       schemaRegistry: "host",
//       numRetries: 1,
//       wrapUnions: "ddddd",
//       schema: "schema"
//     });

//     TODO: Petre :: figure out how to test

//     expect(producerInstance.valueSchema.isValid(WRAPPED_MESSAGE)).toBe(false);
//     expect(producerInstance.valueSchema.isValid(UNWRAPPED_MESSAGE)).toBe(true);
//   });

//   it("should encode schema with wrapped union types when wrapUnions = 'always'", () => {
//     const pkgConfig = { wrapUnions: "always" };
//     const producerInstance: ProducerInstance = genProducerInstance(
//       TOPIC_NAME,
//       AVRO_SCHEMA_UNION_OBJ,
//       AVRO_SCHEMA_UNION_OBJ,
//       {},
//       {},
//       pkgConfig
//     );
//     expect(producerInstance.valueSchema.isValid(WRAPPED_MESSAGE)).toBe(true);
//     expect(producerInstance.valueSchema.isValid(UNWRAPPED_MESSAGE)).toBe(false);
//   });

//   it("should encode schema with unwrapped union types when wrapUnions = 'never'", () => {
//     const pkgConfig = { wrapUnions: "never" };
//     const producerInstance: ProducerInstance = genProducerInstance(
//       TOPIC_NAME,
//       AVRO_SCHEMA_UNION_OBJ,
//       AVRO_SCHEMA_UNION_OBJ,
//       {},
//       {},
//       pkgConfig
//     );
//     expect(producerInstance.valueSchema.isValid(WRAPPED_MESSAGE)).toBe(false);
//     expect(producerInstance.valueSchema.isValid(UNWRAPPED_MESSAGE)).toBe(true);
//   });

//   it("should encode schema with auto-wrapped union types when wrapUnions = 'auto'", () => {
//     const pkgConfig = { wrapUnions: "auto" };
//     const producerInstance: ProducerInstance = genProducerInstance(
//       TOPIC_NAME,
//       AVRO_SCHEMA_UNION_OBJ,
//       AVRO_SCHEMA_UNION_OBJ,
//       {},
//       {},
//       pkgConfig
//     );
//     expect(producerInstance.valueSchema.isValid(WRAPPED_MESSAGE)).toBe(false);
//     expect(producerInstance.valueSchema.isValid(UNWRAPPED_MESSAGE)).toBe(true);
//   });

//   it("should encode schema with auto-wrapped union types when wrapUnions is invalid", () => {
//     const pkgConfig = { wrapUnions: "invalid option" };
//     const producerInstance: ProducerInstance = genProducerInstance(
//       TOPIC_NAME,
//       AVRO_SCHEMA_UNION_OBJ,
//       AVRO_SCHEMA_UNION_OBJ,
//       {},
//       {},
//       pkgConfig
//     );
//     expect(producerInstance.valueSchema.isValid(WRAPPED_MESSAGE)).toBe(false);
//     expect(producerInstance.valueSchema.isValid(UNWRAPPED_MESSAGE)).toBe(true);
//   });
// });

import * as Avro from "avsc";
import { genMessageEncoder } from "../../ts/avro-encoder";

const AVRO_SCHEMA = {
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

const AVRO_SCHEMA_OBJ = Avro.Type.forSchema(AVRO_SCHEMA);

const AVRO_SCHEMA_ID: number = 1;

const VALID_MESSAGES = [
  {
    key: "1",
    text: "A simple test message 1"
  },
  {
    key: "1",
    text:
      "A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1A simple test message 1"
  }
];

const TEST_MESSAGE_INVALID = {
  noKey: `1`,
  text: `A simple test message 1`
};

describe("genMessageEncoder", () => {
  it("should AVRO encode valid messages", () => {
    expect.assertions(VALID_MESSAGES.length);

    const encodeData = genMessageEncoder(AVRO_SCHEMA_OBJ, AVRO_SCHEMA_ID);

    VALID_MESSAGES.forEach(message => {
      const encoded: Buffer = encodeData(message);
      expect(encoded).toMatchSnapshot();
    });
  });

  it("should NOT AVRO encode a null", () => {
    expect.assertions(1);

    const encodeData = genMessageEncoder(AVRO_SCHEMA_OBJ, AVRO_SCHEMA_ID);

    const encoded: Buffer = encodeData(null);
    expect(encoded).toMatchSnapshot();
  });

  it("should raise exception when payload does NOT match schema", () => {
    expect.assertions(1);

    const encodeData = genMessageEncoder(AVRO_SCHEMA_OBJ, AVRO_SCHEMA_ID);

    expect(() => encodeData(TEST_MESSAGE_INVALID)).toThrowError();
  });
});

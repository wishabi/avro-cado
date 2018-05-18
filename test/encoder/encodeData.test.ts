jest.unmock("avsc");

import { encodeData } from "../../ts/avro-encoder";
import * as Avro from "avsc";

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

const TEST_MESSAGE = {
  key: `1`,
  text: `A simple test message 1`
};

const TEST_MESSAGE_INVALID = {
  noKey: `1`,
  text: `A simple test message 1`
};

describe("encodeData", () => {
  it("should AVRO encode a valid message", () => {
    expect.assertions(1);

    const encoded: Buffer = encodeData(
      TEST_MESSAGE,
      AVRO_SCHEMA_ID,
      AVRO_SCHEMA_OBJ
    );
    expect(encoded).toMatchSnapshot();
  });

  it("should NOT AVRO encode a valid message with no schema", () => {
    expect.assertions(1);

    const encoded: Buffer = encodeData(TEST_MESSAGE, -1, null);
    expect(encoded).toMatchSnapshot();
  });

  it("should NOT AVRO encode a null", () => {
    expect.assertions(1);

    const encoded: Buffer = encodeData(null, -1, null);
    expect(encoded).toMatchSnapshot();
  });

  it("should AVRO encode a null", () => {
    expect.assertions(1);

    const encoded: Buffer = encodeData(null, AVRO_SCHEMA_ID, AVRO_SCHEMA_OBJ);
    expect(encoded).toMatchSnapshot();
  });

  it("should raise exception when payload does NOT match schema", () => {
    expect.assertions(1);

    expect(() =>
      encodeData(TEST_MESSAGE_INVALID, AVRO_SCHEMA_ID, AVRO_SCHEMA_OBJ)
    ).toThrowError();
  });
});

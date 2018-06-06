jest.mock("request-promise", () => {
  return jest.fn();
});
import * as Avro from "avsc";
import * as rp from "request-promise";
import { genCreateSchemaResolver } from "../../ts/avro-decoder";
import { Options } from "../../ts/types/types";

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

const AVRO_SCHEMA_INCOMPATIBLE = {
  type: "record",
  name: "TestMessage",
  namespace: "com.flipp.node.kafka.TestMessage2",
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
const AVRO_SCHEMA_INCOMPATIBLE_OBJ = Avro.Type.forSchema(
  AVRO_SCHEMA_INCOMPATIBLE
);
const SCHEMA_ID = 1;

const retrieveSchema = async (id: number): Promise<object> => {
  return AVRO_SCHEMA;
};

const opts: Options = {
  subject: "subject",
  schemaRegistry: "host",
  numRetries: 1,
  schema: AVRO_SCHEMA
};

const createSchemaResolver = genCreateSchemaResolver(opts);

describe("genCreateSchemaResolver", () => {
  it("should return a schema resolver on success", async () => {
    expect.assertions(1);

    rp.mockImplementationOnce(params => {
      return {
        body: {
          schema: JSON.stringify(AVRO_SCHEMA)
        }
      };
    });

    const schemaResolver = await createSchemaResolver(
      SCHEMA_ID,
      AVRO_SCHEMA_OBJ
    );

    expect(schemaResolver).toMatchSnapshot();
  });

  it("should throw an exception on an incompatible schemas", async () => {
    expect.assertions(1);

    rp.mockImplementationOnce(params => {
      return {
        body: {
          schema: JSON.stringify(AVRO_SCHEMA)
        }
      };
    });

    await expect(
      createSchemaResolver(SCHEMA_ID, AVRO_SCHEMA_INCOMPATIBLE_OBJ)
    ).rejects.toMatchSnapshot();
  });
});

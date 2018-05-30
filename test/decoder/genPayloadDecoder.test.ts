import * as Avro from "avsc";
import { genPayloadDecoder } from "../../ts/avro-decoder";
import { DecoderInfo } from "../../ts/types/types";

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
const SCHEMA_ID = 1;

const createSchemaResolver = async (
  id: number,
  schema: Avro.Type
): Promise<object> => {
  return AVRO_SCHEMA_OBJ.createResolver(AVRO_SCHEMA_OBJ);
};

const decoderInfo: DecoderInfo = {
  subject: "subject",
  schema: AVRO_SCHEMA_OBJ,
  resolversMap: {},
  createSchemaResolver: createSchemaResolver
};

const encoded: Buffer = Buffer.from(
  "000000000102312e412073696d706c652074657374206d6573736167652031",
  "hex"
);

describe("genPayloadDecoder", () => {
  it("should decode a non null message successfully with empty resolvers map", async () => {
    expect.assertions(1);

    const decoded = await genPayloadDecoder(decoderInfo)(encoded);

    expect(decoded).toMatchSnapshot();
  });

  it("should decode a non null message successfully with non empty resolvers map", async () => {
    expect.assertions(1);

    const decoderInfo2: DecoderInfo = {
      subject: "subject",
      schema: AVRO_SCHEMA_OBJ,
      resolversMap: {},
      createSchemaResolver: createSchemaResolver
    };

    decoderInfo[SCHEMA_ID] = AVRO_SCHEMA_OBJ.createResolver(AVRO_SCHEMA_OBJ);

    const decoded = await genPayloadDecoder(decoderInfo2)(encoded);

    expect(decoded).toMatchSnapshot();
  });

  it("should decode a null message successfully", async () => {
    expect.assertions(1);

    const decoded = await genPayloadDecoder(decoderInfo)(null);

    expect(decoded).toMatchSnapshot();
  });
});

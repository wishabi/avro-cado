const Avro = require('avsc');
const rp = require('request-promise');

async function _getSchemaById(schemaRegistry, id) {
  const uri = schemaRegistry + '/schemas/ids/' + id;
  const data = await rp({
    uri,
    json: true,
  });
  const schemaString = data.schema;
  return stringToAvroSchema(schemaString);
}

// add a caching layer when calling schema registry
const _cache = {};
const getSchemaById = async(schemaRegistry, id) => {
  lookup =
    _cache[schemaRegistry] =
    _cache[schemaRegistry] || {};
  lookup[id] =
    lookup[id] || _getSchemaById(schemaRegistry, id);

  return lookup[id];
};

function stringToAvroSchema(str) {
  return Avro.Type.forSchema(JSON.parse(str));
}

async function avroDecode(schemaRegistry, schemaString, buffer) {
  const schemaId = buffer.slice(1, 5).readInt32BE(0);
  const baseSchema = stringToAvroSchema(schemaString);
  const msgSchema = await getSchemaById(schemaRegistry, schemaId);
  const resolver = baseSchema.createResolver(msgSchema);
  const decoded = baseSchema.fromBuffer(buffer.slice(5), resolver, true);
  return decoded;
}

async function registerSchema(schemaRegistry, schemaString, subject) {
  const req = {
    method: 'POST',
    uri: schemaRegistry + '/subjects/' + subject + '/versions',
    body: {
      schema: schemaString,
    },
    json: true,
  };
  return rp(req).then(res => res.id);
}

function avroEncode(schemaId, schemaString, msg) {
  const schema = stringToAvroSchema(schemaString);
  const buffer = schema.toBuffer(msg);
  const header = new Buffer(5);
  header[0] = 0;
  header.writeInt32BE(schemaId, 1);
  return Buffer.concat([header, buffer]);
}

// exports
module.exports.getSchemaById = getSchemaById;
module.exports.avroDecode = avroDecode;
module.exports.createDecoder = (schemaRegistry, schemaString) =>
  async(buffer) => await avroDecode(schemaRegistry, schemaString, buffer);

module.exports.registerSchema = registerSchema;
module.exports.avroEncode = avroEncode;
module.exports.createEncoder = async(schemaRegistry, schemaString, subject) => {
  const schemaId = await registerSchema(schemaRegistry, schemaString, subject);
  return (msg) => avroEncode(schemaId, schemaString, msg);
};

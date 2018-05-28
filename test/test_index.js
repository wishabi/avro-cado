const fs = require('fs');
const expect = require('chai').expect;
const sinon = require('sinon');
const schemaRegistry = 'http://schema-registry:8081';
const schemaString = fs.readFileSync(
    __dirname + '/schemas/mySchema.avsc',
    {encoding: 'utf8'},
);
const topicName = 'my_topic_subject_name';

describe('encoder_decoder', () => {
  const encoder_decoder = require('../index');
  const msg = {
    foo: 'bar',
    baz: 123,
  }
  let buffer;

  describe('encoder', () => {
    let encoder;
    it('registers a schema', async () => {
      const id = await encoder_decoder.registerSchema(
          schemaRegistry, 
          schemaString,
          topicName,
      );
      expect(id).to.equal(1);
    });
    it('creates an encoder', async () => {
      encoder = await encoder_decoder.createEncoder(
        schemaRegistry,
        schemaString,
        topicName,
      );
    });

    it('encodes data', (done) => {
      buffer = encoder(msg);
      done();
    });
  });

  describe('decoder', () => {
    let decoder;
    it('creates a decoder', (done) => {
      decoder = encoder_decoder.createDecoder(
        schemaRegistry,
        schemaString,
      );
      done();
    });

    it('decodes buffers', async () => {
      const decoded = await decoder(buffer);
      expect(decoded.foo).to.equal(msg.foo);
      expect(decoded.baz).to.equal(msg.baz);
    });
  });

});

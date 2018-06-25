# [package-name]

[![jest](https://facebook.github.io/jest/img/jest-badge.svg)](https://github.com/facebook/jest) [![Download count](https://img.shields.io/npm/dm/avsc.svg)](https://www.npmjs.com/package/avsc) [![Build status](https://travis-ci.org/mtth/avsc.svg?branch=master)](https://travis-ci.org/mtth/avsc) [![Coverage status](https://coveralls.io/repos/mtth/avsc/badge.svg?branch=master&service=github)](https://coveralls.io/github/mtth/avsc?branch=master)

`^^^ Placeholders for some badges we may want to put up ^^^`

## Features

- Typescript package that implements Avro encoding and decoding
- Follows the Avro serialization conventions of [Confluent's Schema Registry](https://github.com/confluentinc/schema-registry). During deserialization, schemas are obtained from the registry using their 4-byte id prefix. When serializing data, schemas are registered to the registry and obtain the corresponding 4-byte id prefix.
- Easy to use interface. All of [Confluent's Schema Registry](https://github.com/confluentinc/schema-registry) flows are implemented in the package
- Supports evolution. Converts Avro-encoded payloads into a format specified by the application's Avro schema.

## Installation

```
npm install [package-name]
```

## Examples

#### Avro schema

```javascript
// Avro schema
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
```

#### Options

```javascript
// package options
const opts = {
  schemaRegistry: "http://localhost:8081",
  numRetries: 10,
  subject: "test-value",
  schema: avroSchema
};
```

#### Create Encoder and use it

```javascript
const encodeFunc = await createEncoder(opts);

// encode a message
const encoded: Buffer = encodeFunc(message);
```

#### Create Decoder and use it

```javascript
const decodeFunc = createDecoder(opts);

// decode a message
const decoded = await decodeFunc(encoded);
```

## Making Changes

- Ensure typescript is installed: `npm install -g typescript`
- Install all dependencies: `npm install`
- Make changes
- Run `npm run package`. This will remove the `release` directory, run `tsc` and add the release directory back to git. **The release directory needs to be updated every commit to include changes in the library**.
- Update the `version` in `package.json`
- Add your changes to git, and commit.



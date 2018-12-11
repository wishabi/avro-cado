## avro-cado

[![jest](https://facebook.github.io/jest/img/jest-badge.svg)](https://github.com/facebook/jest)

## Features

- Simple package that implements Avro encoding and decoding
- Written in Typescript
- Follows the Avro serialization conventions of [Confluent's Schema Registry](https://github.com/confluentinc/schema-registry). During deserialization, schemas are obtained from the registry using their 4-byte id prefix. When serializing data, schemas are registered to the registry and obtain the corresponding 4-byte id prefix.
- Easy to use interface. All of [Confluent's Schema Registry](https://github.com/confluentinc/schema-registry) flows are implemented in the package
- Supports evolution. Converts Avro-encoded payloads into a format specified by the application's Avro schema.

## Sample use case

- We use this when consuming and producing Kakfa messages

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
const opts: Options = {
  schemaRegistry: "http://localhost:8081",
  numRetries: 10, // number of attempts to call schemaRegistry
  wrapUnions: "auto", // avsc option
  subject: "test-value", // subject for schema registration
  schema: avroSchema, // schema object as needed for avsc
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



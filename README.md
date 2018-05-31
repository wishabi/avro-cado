# [package-name]

[![jest](https://facebook.github.io/jest/img/jest-badge.svg)](https://github.com/facebook/jest) [![Download count](https://img.shields.io/npm/dm/avsc.svg)](https://www.npmjs.com/package/avsc) [![Build status](https://travis-ci.org/mtth/avsc.svg?branch=master)](https://travis-ci.org/mtth/avsc) [![Coverage status](https://coveralls.io/repos/mtth/avsc/badge.svg?branch=master&service=github)](https://coveralls.io/github/mtth/avsc?branch=master)

`^^^ Placeholders for some badges we may want to put up ^^^`

## Features

* Typescript package that implements Avro encoding and decoding
* Use an instance of `Schema Registry` to look up schemas when decoding and register schemas when encoding
* Easy to use interface. All of the `Schema Registry` flows are implemented in the package
* Perform Avro schema resolution from the Avro schema a payload is encoded with to the Avro schema the application knows how to handle

## Installation

```
npm install [package-name]
```

## Making Changes

* Make sure you have typescript installed: `npm install -g typescript`
* Run `npm install` to install all dependencies
* Make changes
* Run `npm run package`. This will remove the `release` directory, run `tsc` and add the release directory back to git. **The release directory needs to be updated every commit to include changes in the library**.
* Update the `version` in `package.json`
* Add your changes to git, and commit.

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

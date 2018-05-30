# Flipp SR Enc Dec

TODO

## Installation

TODO

```
npm install <package name> TODO
```

## Making Changes

1.  Make sure you have typescript installed: `npm install -g typescript`
2.  Run `npm install` to install all dependencies
3.  Make changes
4.  Run `npm run package` . This will remove the _release_ directory, run _tsc_ and
    add the release directory back to git. **The release directory needs to be updated
    every commit to include changes in the library**.
5.  Update **version** in _package.json_
6.  Add your changes to git, and commit.

## Examples

Inside a node.js module, or using browserify:

```javascript
const avro = require("avsc");
```

* Avro schema

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

* Options

  ```javascript
  // package options
  const opts = {
    schemaRegistry: "http://localhost:8081",
    numRetries: 10,
    subject: "test-value",
    schema: avroSchema
  };
  ```

* Create Encoder and use it

  ```javascript
  const encodeFunc = await createEncoder(opts);

  // encode a message
  const encoded: Buffer = encodeFunc(message);
  ```

* Create Decoder and use it

  ```javascript
  const decodeFunc = createDecoder(opts);

  // decode a message
  const decoded = await decodeFunc(encoded);
  ```

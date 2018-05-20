"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const config_1 = require("./config");
const rp = require("request-promise");
const Avro = require("avsc");
/**
 * Register the specified schema for the specified topic under the
 * specifed subject. The subject used is: <topic>-<key|value>
 *
 * @param subject - the subject under which to register the schema
 * @param schemaRegistry - the schema registry host
 * @param numRetries - the number of retries to register before throwing an error
 * @param schema - the schema to register
 *
 * @return - A Promise holding the id of the schema in the schema registry
 */
exports.registerSchema = ({ subject, schemaRegistry, numRetries, schema }) => __awaiter(this, void 0, void 0, function* () {
    // null schema so nothing to register
    if (!schema) {
        return -1;
    }
    // craft the REST call to the schema registry
    const req = {
        method: "POST",
        uri: `${schemaRegistry}/subjects/${subject}/versions`,
        headers: { Accept: config_1.ACCEPT_HEADERS },
        body: {
            schema: JSON.stringify(schema)
        },
        json: true,
        resolveWithFullResponse: true
    };
    let schemaId;
    let error = null;
    // implement retry on certain status/reason codes
    for (let i = 0; i <= numRetries; i += 1) {
        try {
            schemaId = (yield rp(req)).body.id;
            // make sure to clear any previous errors
            error = null;
            break;
        }
        catch (err) {
            // save the error
            error = err;
            if (util_1.handleError(err) && i + 1 <= numRetries) {
                // try and try again until we run out of retries
                continue;
            }
            // fatal error
            break;
        }
    }
    if (error) {
        throw new Error(`Failed to register schema for subject ${subject} :: ${error.message}`);
    }
    return schemaId;
});
/**
 * @todo Fix doc comment
 * Encode an Avro value into a message, as expected by Confluent's Kafka Avro
 * deserializer.
 *
 * @param message - message to encode
 */
exports.encodeData = (payload, schemaId, schema, length = 1024) => {
    if (payload === null) {
        // no payload so return it
        return null;
    }
    if (schemaId === -1) {
        // Bufferify the payload
        return Buffer.from(JSON.stringify(payload));
    }
    const buf = new Buffer(length);
    buf[0] = 0; // magic byte
    buf.writeInt32BE(schemaId, 1);
    const pos = schema.encode(payload, buf, 5);
    if (pos < 0) {
        // the buffer was too short, we need to resize
        return exports.encodeData(payload, schemaId, schema, length - pos);
    }
    return buf.slice(0, pos);
};
const genMessageEncoder = ({ schema, schemaId }) => (message) => {
    return exports.encodeData(message, schemaId, schema);
};
const createAvroSchema = ({ wrapUnions, schema }) => {
    if (schema) {
        return Avro.Type.forSchema(schema, { wrapUnions });
    }
    return null;
};
/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/
exports.createEncoder = (opts) => __awaiter(this, void 0, void 0, function* () {
    // Aggregare the configuration values with defaults
    const mergedOpts = config_1.processOptions(opts);
    // encoder info
    const encoderInfo = {
        schema: null,
        schemaId: -1
    };
    // register the value and key schemas and parse them
    [encoderInfo.schema, encoderInfo.schemaId] = yield Promise.all([
        createAvroSchema(mergedOpts),
        exports.registerSchema(mergedOpts)
    ]);
    return genMessageEncoder(encoderInfo);
});
//# sourceMappingURL=avro-encoder.js.map
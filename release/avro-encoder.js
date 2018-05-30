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
const rp = require("request-promise");
const Avro = require("avsc");
const util_1 = require("./util");
const config_1 = require("./config");
/**
 * Register the specified schema for the specified topic under the
 * specified subject.
 *
 * On an error eligible for retry, keep trying up to the specified number
 * of times. Once all retries have been exhausted, any error is considered
 * a fatal one.
 *
 *
 * @param subject - the subject under which to register the schema
 * @param schemaRegistry - the schema registry host
 * @param numRetries - the number of retries to register before throwing an error
 * @param schema - the schema to register
 *
 * @return - A Promise holding the id of the schema in the schema registry
 */
exports.registerSchema = ({ subject, schemaRegistry, schema, numRetries }) => __awaiter(this, void 0, void 0, function* () {
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
    let error = null;
    // implement retry on certain status/reason codes
    for (let i = 0; i <= numRetries; i += 1) {
        try {
            return (yield rp(req)).body.id;
        }
        catch (err) {
            // save the error
            error = err;
            if (!util_1.handleError(err)) {
                break;
            }
        }
    }
    throw new Error(`Failed to register schema for subject ${subject} :: ${error.message}`);
});
/**
 * Create a function that takes a message JSON object
 * and Avro encodes it
 *
 * @param payload - the JSON object to Avro encode
 * @return - The Avro encoded object as a Buffer
 */
exports.genMessageEncoder = (schema, schemaId) => (payload) => {
    if (payload === null) {
        // no payload so return it
        return null;
    }
    // create the avro header
    const header = new Buffer(5);
    // magic byte
    header.writeInt8(0, 0);
    // schema id
    header.writeInt32BE(schemaId, 1);
    // Avro encode the payload
    const buffer = schema.toBuffer(payload);
    return Buffer.concat([header, buffer]);
};
/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/
exports.createEncoder = (opts) => __awaiter(this, void 0, void 0, function* () {
    // Aggregate the configuration values with defaults
    const mergedOpts = config_1.processOptions(opts);
    return exports.genMessageEncoder(Avro.Type.forSchema(mergedOpts.schema, {
        wrapUnions: mergedOpts.wrapUnions
    }), yield exports.registerSchema(mergedOpts));
});
//# sourceMappingURL=avro-encoder.js.map
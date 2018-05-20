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
    try {
        return (yield rp(req)).body.id;
    }
    catch (err) {
        if (numRetries === 0 || util_1.handleError(err) === false) {
            throw new Error(`Failed to register schema for subject ${subject} :: ${err.message}`);
        }
        return exports.registerSchema({
            subject,
            schemaRegistry,
            numRetries: numRetries - 1,
            schema
        });
    }
});
exports.genMessageEncoder = (schema, schemaId) => (message) => {
    if (message === null) {
        // no payload so return it
        return null;
    }
    let length = 1024;
    for (;;) {
        const buf = new Buffer(length);
        buf[0] = 0; // magic byte
        buf.writeInt32BE(schemaId, 1);
        const pos = schema.encode(message, buf, 5);
        if (pos < 0) {
            // the buffer was too short, we need to resize
            length -= pos;
            continue;
        }
        return buf.slice(0, pos);
    }
};
/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/
exports.createEncoder = (opts) => __awaiter(this, void 0, void 0, function* () {
    // Aggregare the configuration values with defaults
    const mergedOpts = config_1.processOptions(opts);
    return exports.genMessageEncoder(Avro.Type.forSchema(mergedOpts.schema, {
        wrapUnions: mergedOpts.wrapUnions
    }), yield exports.registerSchema(mergedOpts));
});
//# sourceMappingURL=avro-encoder.js.map
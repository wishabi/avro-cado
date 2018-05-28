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
const Avro = require("avsc");
const rp = require("request-promise");
const config_1 = require("./config");
const util_1 = require("./util");
/**
 * Retrieve the Avro schema from the schema registry. On an error
 * eligible for retry, try up to the configure number of times
 *
 * @param id - the schema id that should be retrieved
 * @return - The Avro schema requested
 */
const genSchemaRetriever = ({ subject, schemaRegistry, numRetries }) => (id) => __awaiter(this, void 0, void 0, function* () {
    const req = {
        uri: `${schemaRegistry}/schemas/ids/${id}`,
        headers: [{ Accept: config_1.ACCEPT_HEADERS }],
        json: true,
        resolveWithFullResponse: true
    };
    let schema;
    let error = null;
    // implement retry on certain status/reason codes
    for (let i = 0; i <= numRetries; i += 1) {
        try {
            schema = JSON.parse((yield rp(req)).body.schema);
            // make sure to clear any previous errors
            error = null;
            break;
        }
        catch (err) {
            // save the error
            error = err;
            if (!util_1.handleError(err)) {
                break;
            }
        }
    }
    if (error) {
        throw new Error(`Failed to retrieve schema for subject ${subject} with id ${id} :: ${error.message}`);
    }
    return schema;
});
/**
 * Retrieve the Avro schema from the schema registry, parse it,
 * and create a resolver to the local Avro schema.
 *
 * @param subject - The subject under which the schema is registered
 * @param id - the schema id that should be the source for the
 *             schema resolver
 * @param schema - the target Avro schema for the resolver
 * @return - The Avro schema resolver used to convert messages
 *           encoded with the specified Avro schema to the local
 *           Avro schema format
 */
const genCreateSchemaResolver = ({ subject, retrieveSchema }) => (id, schema) => __awaiter(this, void 0, void 0, function* () {
    /**
     * Retrieve the schema by ID from the schema registry ...
     */
    const msgSchema = yield retrieveSchema(id);
    /**
     * ... parse the schema ...
     */
    const avSourceSchema = Avro.Type.forSchema(msgSchema);
    /**
     * ... and create a resolver to the schema we know how to consume
     */
    return schema.createResolver(avSourceSchema);
});
/**
 * Create and return an Avro schema resolver, if one doesn't already
 * exist for the schema id in the encoded message to the schema passed
 * in
 *
 * @param encoded - The Avro encoded buffer
 * @param schema - the target Avro schema for the resolver
 * @return - The promise that holds the Avro resolver
 */
const genGetSchemaResolver = ({ subject, resolversMap, createSchemaResolver }) => (encoded, schema) => __awaiter(this, void 0, void 0, function* () {
    // Do not attempt to get a resolver
    if (!schema) {
        return null;
    }
    if (!encoded) {
        return null;
    }
    /**
     * Extract the schema id with which the buffer was encoded
     */
    const id = encoded.slice(1, 5).readInt32BE(0);
    if (!resolversMap[id]) {
        /**
         * We do not have a resolver from the source schema to the
         * schema we support. Go and get a resolver.
         *
         * IMPORTANT
         *
         * We store a promise of a resolver in our hashmap. The reason is that
         * if we have multiple messages being handled asynchronously, we do not
         * want all of them to flood the schema registry with REST calls
         * to retrieve the schema
         */
        resolversMap[id] = createSchemaResolver(id, schema);
    }
    return resolversMap[id];
});
/**
 * Avro decode the passed in data
 *
 * @param encoded - The Avro encoded buffer
 * @param schema - the target Avro schema to which the decoded payload
 *                 should conform
 * @param resolver - a promise for an Avro resolver that will
 *                   convert the data from the schema with which
 *                   it was encoded to the schema which we want to
 *                   read
 * @return - The promise that holds the Avro decoded payload
 */
const decodePayload = (encoded, schema, resolver) => __awaiter(this, void 0, void 0, function* () {
    // Do not attempt to avro decode if we have no target schema specified
    if (!schema) {
        return encoded;
    }
    // Do not attempt to avro decode null value
    if (!encoded) {
        return encoded;
    }
    return schema.decode(encoded.slice(5), 0, yield resolver).value;
});
/**
 * Create an Avro decoder based on the specified parameters and
 * return a closure that takes an encoded Buffer and decodes it
 *
 * @param schema - the target Avro schema to which the decoded payload
 *                 should conform
 * @param getSchemaResolver - a function used to retrieve the resolver
 *                            object that will be used to decode the payload
 * @param buffer - The Avro encoded buffer
 * @return - The Avro decoded object that conforms to the specified schema
 */
const genMessageDecoder = ({ schema, getSchemaResolver }) => (buffer) => __awaiter(this, void 0, void 0, function* () {
    return yield decodePayload(buffer, schema, getSchemaResolver(buffer, schema));
});
/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/
exports.createDecoder = (opts) => {
    // Aggregate the configuration values with defaults
    const mergedOpts = config_1.processOptions(opts);
    // decoder info
    const decoderInfo = {
        subject: mergedOpts.subject,
        schema: mergedOpts.schema ? Avro.Type.forSchema(mergedOpts.schema) : null,
        resolversMap: {},
        retrieveSchema: null,
        createSchemaResolver: null,
        getSchemaResolver: null
    };
    decoderInfo.retrieveSchema = genSchemaRetriever(mergedOpts);
    decoderInfo.createSchemaResolver = genCreateSchemaResolver(decoderInfo);
    decoderInfo.getSchemaResolver = genGetSchemaResolver(decoderInfo);
    return genMessageDecoder(decoderInfo);
};
//# sourceMappingURL=avro-decoder.js.map
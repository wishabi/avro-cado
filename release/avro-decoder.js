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
// import Avro = require("avsc");
const Avro = require("avsc");
const config_1 = require("./config");
const util_1 = require("./util");
const rp = require("request-promise");
/**
 * Retrieve the AVRO schema from the schema registry. On a
 * retrieable error, retry up to the configure number of times
 *
 * @param id - the schema id that should be retrieved
 * @return - The AVRO schema requested
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
            // see if it can be retried
            const retry = util_1.handleError(err, config_1.decodeLogger, "get schema");
            if (retry && i + 1 <= numRetries) {
                // try and try again until we run out of retries
                continue;
            }
            // fatal error
            break;
        }
    }
    if (error) {
        config_1.decodeLogger.error(`Failed to retrieve schema for subject ${subject} with id ${id}`, error, { subject, id });
        throw new Error(`Failed to retrieve schema for subject ${subject} with id ${id}`);
    }
    return schema;
});
/**
 * Retrieve the AVRO schema from the schema registry, parse it,
 * and create a resolver to the local AVRO schema.
 *
 * @param subject - The subject under which the schema is registered
 * @param id - the schema id that should be the source for the
 *             schema resolver
 * @param avroSchema - the target AVRO schema for the resolver
 * @return - The AVRO schema resolver used to convert messages
 *           encoded with the specified AVRO schema to the local
 *           AVRO schema format
 */
const genCreateSchemaResolver = ({ subject, retrieveSchema }) => (id, schema) => __awaiter(this, void 0, void 0, function* () {
    /**
     * Retrieve the schema by ID from the schema registry ...
     */
    const msgSchema = yield retrieveSchema(id);
    config_1.decodeLogger.info("Retrieved schema", { id, subject });
    /**
     * ... parse the schema ...
     */
    const avSourceSchema = Avro.Type.forSchema(msgSchema);
    /**
     * ... and create a resolver to the schema we know how to consume
     */
    config_1.decodeLogger.info("Created resolver", { id, subject });
    try {
        return schema.createResolver(avSourceSchema);
    }
    catch (error) {
        throw new Error("Incompatible schemas");
    }
});
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
        config_1.decodeLogger.info("Did not find resolver", { id, subject });
        /**
         * We do not have a resolver from the source schema to the
         * schema we support. Go and get a resolver.
         *
         * IMPORTANT
         *
         * We store a promise of a resolver in our hashmap. The reason is that
         * if we have multipe messages beig handled asynchronously, we do not
         * want all of them to flood the schema registry with REST calls
         * to retrieve the schema
         */
        resolversMap[id] = createSchemaResolver(id, schema);
        config_1.decodeLogger.info("Retrieving resolver", { id, subject });
    }
    return resolversMap[id];
});
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
const genMessageDecoder = ({ schema, getSchemaResolver }) => (buffer) => __awaiter(this, void 0, void 0, function* () {
    return yield decodePayload(buffer, schema, yield getSchemaResolver(buffer, schema));
});
/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/
exports.createTopicDecoder = ({ schemaRegistry, numRetries, wrapUnions, subject, schema }) => {
    // Aggregare the configuration values with defaults
    const mergedOptions = util_1.aggregateOptions(config_1.optionsDefault, {
        schemaRegistry,
        numRetries,
        wrapUnions,
        subject,
        schema
    });
    // topic info
    const topicInfo = {
        subject: subject,
        schema: schema ? Avro.Type.forSchema(schema) : null,
        resolversMap: {},
        retrieveSchema: null,
        createSchemaResolver: null,
        getSchemaResolver: null
    };
    topicInfo.retrieveSchema = genSchemaRetriever(mergedOptions);
    topicInfo.createSchemaResolver = genCreateSchemaResolver(topicInfo);
    topicInfo.getSchemaResolver = genGetSchemaResolver(topicInfo);
    return genMessageDecoder(topicInfo);
};
//# sourceMappingURL=avro-decoder.js.map
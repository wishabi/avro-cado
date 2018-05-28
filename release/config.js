"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../ts/util");
exports.ACCEPT_HEADERS = "application/vnd.schemaregistry.v1+json, application/vnd.schemaregistry+json, application/json";
const optionsDefault = {
    schemaRegistry: "http://localhost:8081",
    numRetries: 10,
    wrapUnions: "auto",
    subject: null,
    schema: null
};
exports.processOptions = (opts) => {
    if (!opts.subject) {
        throw new Error("subject key missing");
    }
    if (!opts.schema) {
        throw new Error("schema key missing");
    }
    // Aggregate the configuration values with defaults
    return util_1.aggregateOptions(optionsDefault, opts);
};
//# sourceMappingURL=config.js.map
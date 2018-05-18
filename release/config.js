"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flipp_node_logger_1 = require("@flipp/flipp-node-logger");
exports.ACCEPT_HEADERS = "application/vnd.schemaregistry.v1+json, application/vnd.schemaregistry+json, application/json";
exports.optionsDefault = {
    schemaRegistry: "http://localhost:8081",
    numRetries: 10,
    wrapUnions: "auto",
    subject: "DEFAULT",
    schema: null
};
exports.encodeLogger = new flipp_node_logger_1.Logger("encodeLogger");
exports.decodeLogger = new flipp_node_logger_1.Logger("decodeLogger");
//# sourceMappingURL=config.js.map
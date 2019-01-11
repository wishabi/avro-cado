"use strict";
/* tslint:disable:no-console */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const avro_decoder_1 = require("../avro-decoder");
const avro_encoder_1 = require("../avro-encoder");
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
const message = {
    key: `1`,
    text: `A simple test message 1`
};
const encodeDecode = () => __awaiter(this, void 0, void 0, function* () {
    const opts = {
        schemaRegistry: "http://localhost:8081",
        numRetries: 10,
        subject: "test-value",
        schema: avroSchema
    };
    /*
     *****************************************************************
     *                                                 encoder example
     *****************************************************************
     */
    console.log(`Before encoder:               ${JSON.stringify(message)}`);
    // create the encoder
    const encodeFunc = yield avro_encoder_1.createEncoder(opts);
    // encode a message
    const encoded = encodeFunc(message);
    console.log(`After encoder before decoder: ${encoded.toString("hex")}`);
    /*
     *****************************************************************
     *                                                 decoder example
     *****************************************************************
     */
    // create a decoder
    const decodeFunc = avro_decoder_1.createDecoder(opts);
    // decode a message
    const decoded = yield decodeFunc(encoded);
    console.log(`After decoder:                ${JSON.stringify(decoded)}`);
});
(() => __awaiter(this, void 0, void 0, function* () {
    yield encodeDecode();
}))();
//# sourceMappingURL=encode_decode.js.map
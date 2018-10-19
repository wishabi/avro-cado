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
    name: "Merchant",
    namespace: "com.flipp.fadmin",
    fields: [
        {
            name: "configuration_name",
            type: ["null", "string"],
            default: null
        },
        {
            name: "content_aggregation_config_name",
            type: ["null", "string"],
            default: null
        },
        {
            name: "created_at",
            type: "long"
        },
        {
            name: "display_external_description",
            type: "boolean",
            default: false
        },
        {
            name: "flyer_flip",
            type: "boolean",
            default: false
        },
        {
            name: "id",
            type: "long",
            doc: "This field is used as the key."
        },
        {
            name: "large_image_path",
            type: ["null", "string"],
            default: null
        },
        {
            name: "m1000_enabled",
            type: "boolean",
            default: false
        },
        {
            name: "merchant_group_id",
            type: ["null", "int"],
            default: null
        },
        {
            name: "name_identifier",
            type: "string",
            default: ""
        },
        {
            name: "translations",
            type: {
                type: "map",
                values: [
                    {
                        type: "record",
                        name: "MerchantTranslation",
                        namespace: "com.flipp.fadmin",
                        fields: [
                            {
                                name: "name",
                                type: "string",
                                default: "",
                                doc: "The translated name for this locale."
                            },
                            {
                                name: "display_name",
                                type: "string",
                                default: "",
                                doc: "The translated display name for this locale."
                            }
                        ]
                    }
                ]
            },
            default: {},
            doc: "List of translations for this merchant. eg. {'en' (locale): 'merchant' (name)}"
        },
        {
            name: "show_in_search",
            type: "boolean",
            default: false
        },
        {
            name: "storefront_logo_url",
            type: ["null", "string"],
            default: null
        },
        {
            name: "updated_at",
            type: "long"
        },
        {
            name: "ftp_base_path",
            type: "string",
            default: "/"
        },
        {
            name: "ftp_username",
            type: ["null", "string"],
            default: null
        },
        {
            name: "throttle_limit",
            type: "int",
            default: 75
        },
        {
            name: "us_based",
            type: "boolean"
        },
        {
            name: "message_id",
            type: "string",
            doc: "UUID",
            default: ""
        },
        {
            name: "timestamp",
            type: "string",
            doc: "ISO 8601 datetime.  Format: YYYY-MM-DD HH:MM:SS -0500",
            default: ""
        }
    ]
};
const message = {
    id: 1,
    configuration_name: "",
    content_aggregation_config_name: "",
    created_at: 1,
    display_external_description: false,
    flyer_flip: false,
    large_image_path: null,
    m1000_enabled: false,
    merchant_group_id: null,
    name_identifier: "merchz",
    translations: {
        en: {
            name: "new english name",
            display_name: "new english name"
        }
    },
    show_in_search: false,
    storefront_logo_url: null,
    updated_at: 1,
    ftp_base_path: "/", ftp_username: "", throttle_limit: 75,
    us_based: false, message_id: "",
    timestamp: ""
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
//# sourceMappingURL=example.js.map
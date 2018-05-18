import { Options, DecodeFunc } from "./types/types";
/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/
export declare const createTopicDecoder: ({ schemaRegistry, numRetries, wrapUnions, subject, schema }: Options) => DecodeFunc;

import { Options, EncodeFunc } from "./types/types";
/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/
export declare const createTopicEncoder: ({ schemaRegistry, numRetries, wrapUnions, subject, schema }: Options) => Promise<EncodeFunc>;

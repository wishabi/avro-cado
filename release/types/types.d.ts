/// <reference types="node" />
import * as Avro from "avsc";
export interface Options {
    schemaRegistry: string;
    numRetries: number;
    schema: any;
    subject: string;
    wrapUnions?: string;
}
export interface EncodeFunc {
    (message: object): Buffer;
}
export declare type ResolverMap = {
    [index: number]: Promise<Avro.Resolver>;
};
export interface DecoderInfo {
    subject: string;
    schema: Avro.Type | null;
    resolversMap: ResolverMap;
    retrieveSchema: Function;
    createSchemaResolver: Function;
    getSchemaResolver: Function;
}
export interface DecodeFunc {
    (buffer: Buffer): Promise<Object>;
}

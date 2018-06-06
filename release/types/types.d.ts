/// <reference types="node" />
import * as Avro from "avsc";
export interface Options {
    schemaRegistry: string;
    numRetries: number;
    schema: any;
    subject: string;
    wrapUnions?: string;
}
export declare type EncodeFunc = (message: object) => Buffer;
export interface ResolverMap {
    [index: string]: Promise<Avro.Resolver>;
}
export declare type SchemaResolverFunc = (id: number, schema: Avro.Type) => Promise<Avro.Resolver>;
export interface DecoderInfo {
    subject: string;
    schema: Avro.Type;
    resolversMap: ResolverMap;
    createSchemaResolver: SchemaResolverFunc;
}
export declare type DecodeFunc = (buffer: Buffer) => Promise<object>;

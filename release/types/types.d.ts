/// <reference types="node" />
import * as Avro from "avsc";
export interface IOptions {
    schemaRegistry: string;
    numRetries: number;
    schema: any;
    subject: string;
    wrapUnions?: string;
}
export declare type EncodeFunc = (message: object) => Buffer;
declare type SchemaResolverFunc = (id: number, schema: Avro.Type) => Promise<Avro.Resolver>;
export interface IResolverMap {
    [index: number]: Promise<Avro.Resolver>;
}
export interface IDecoderInfo {
    subject: string;
    schema: Avro.Type;
    resolversMap: IResolverMap;
    createSchemaResolver: SchemaResolverFunc;
}
export declare type DecodeFunc = (buffer: Buffer) => Promise<object>;
export {};

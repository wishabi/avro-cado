import * as Avro from "avsc";

/*
 ********************************************************
 *                                          PACKAGE TYPES
 ********************************************************
 */

export interface IOptions {
  schemaRegistry: string;
  numRetries: number;
  schema: any;
  subject: string;
  wrapUnions?: string;
}

/*
 ********************************************************
 *                                          ENCODER TYPES
 ********************************************************
 */

export type EncodeFunc = (message: object) => Buffer;
type SchemaResolverFunc = (
  id: number,
  schema: Avro.Type
) => Promise<Avro.Resolver>;

/*
 ********************************************************
 *                                          DECODER TYPES
 ********************************************************
 */

export interface IResolverMap {
  [index: number]: Promise<Avro.Resolver>;
}

export interface IDecoderInfo {
  subject: string;
  schema: Avro.Type;
  resolversMap: IResolverMap;
  createSchemaResolver: SchemaResolverFunc;
}

export type DecodeFunc = (buffer: Buffer) => Promise<object>;

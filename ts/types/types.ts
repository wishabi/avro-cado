import * as Avro from "avsc";

/*
 ********************************************************
 *                                          PACKAGE TYPES
 ********************************************************
 */

export interface Options {
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

/*
 ********************************************************
 *                                          DECODER TYPES
 ********************************************************
 */

export interface ResolverMap { [index: number]: Promise<Avro.Resolver> }

export interface DecoderInfo {
  subject: string;
  schema: Avro.Type;
  resolversMap: ResolverMap;
  createSchemaResolver: Function;
}

export type DecodeFunc = (buffer: Buffer) => Promise<Object>;

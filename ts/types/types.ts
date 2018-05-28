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

export interface EncodeFunc {
  (message: object): Buffer;
}

/*
 ********************************************************
 *                                          DECODER TYPES
 ********************************************************
 */

export type ResolverMap = { [index: number]: Promise<Avro.Resolver> };

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

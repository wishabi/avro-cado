import * as Avro from "avsc";

/*
 ********************************************************
 *                                          PACKAGE TYPES
 ********************************************************
 */

// export interface Message {
//   topic: string;
//   value: Buffer;
//   offset: number;
//   partition: number;
//   key: Buffer;
//   size: number;
//   timestamp: number;
// }

export interface Options {
  schemaRegistry: string;
  numRetries: number;
  wrapUnions: string;
  subject: string;
  schema: any | null;
}

/*
 ********************************************************
 *                                          ENCODER TYPES
 ********************************************************
 */

export interface EncoderTopicInfo {
  schema: Avro.Type | null;
  schemaId: number;
}

export interface EncodeFunc {
  (message: object): Buffer;
}

/*
 ********************************************************
 *                                          DECODER TYPES
 ********************************************************
 */

export type ResolverMap = { [index: number]: Promise<Avro.Resolver> };

export interface DecoderTopicInfo {
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

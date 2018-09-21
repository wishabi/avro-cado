import { EncodeFunc, IOptions } from "./types/types";
/**
 * Register the specified schema for the specified topic under the
 * specified subject.
 *
 * On an error eligible for retry, keep trying up to the specified number
 * of times. Once all retries have been exhausted, any error is considered
 * a fatal one.
 *
 *
 * @param subject - the subject under which to register the schema
 * @param schemaRegistry - the schema registry host
 * @param numRetries - the number of retries to register before throwing an error
 * @param schema - the schema to register
 *
 * @return - A Promise holding the id of the schema in the schema registry
 */
export declare const registerSchema: ({ subject, schemaRegistry, schema, numRetries }: IOptions) => Promise<number>;
/**
 * Create a function that takes a message JSON object
 * and Avro encodes it
 *
 * @param payload - the JSON object to Avro encode
 * @return - The Avro encoded object as a Buffer
 */
export declare const genMessageEncoder: (schema: any, schemaId: number) => EncodeFunc;
/*****************************************************************/
/*****************************************************************/
export declare const createEncoder: (opts: IOptions) => Promise<EncodeFunc>;

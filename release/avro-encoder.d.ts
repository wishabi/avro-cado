import { EncodeFunc } from "./types/types";
/**
 * Register the specified schema for the specified topic under the
 * specifed subject. The subject used is: <topic>-<key|value>
 *
 * @param subject - the subject under which to register the schema
 * @param schemaRegistry - the schema registry host
 * @param numRetries - the number of retries to register before throwing an error
 * @param schema - the schema to register
 *
 * @return - A Promise holding the id of the schema in the schema registry
 */
export declare const registerSchema: ({ subject, schemaRegistry, numRetries, schema }: {
    subject: any;
    schemaRegistry: any;
    numRetries: any;
    schema: any;
}) => Promise<number>;
export declare const genMessageEncoder: (schema: any, schemaId: number) => EncodeFunc;
/*****************************************************************/
/**                      EXPORTED INTERFACE                     **/
/*****************************************************************/
export declare const createEncoder: (opts: any) => Promise<EncodeFunc>;

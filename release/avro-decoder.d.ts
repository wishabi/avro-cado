import { DecodeFunc, DecoderInfo, Options, SchemaResolverFunc } from "./types/types";
/**
 * Retrieve the Avro schema from the schema registry. On an error
 * eligible for retry, try up to the configure number of times
 *
 * @param subject - the subject under which the schema is registered
 * @param schemaRegistry - the schema registry path
 * @param numRetries - the number of retries
 * @param id - the schema id that should be retrieved
 * @return - The Avro schema requested
 */
export declare const retrieveSchema: ({ subject, schemaRegistry, numRetries }: Options, id: number) => Promise<any>;
/**
 * Retrieve the Avro schema from the schema registry, parse it,
 * and create a resolver to the local Avro schema.
 *
 * @param id - the schema id that should be the source for the
 *             schema resolver
 * @param schema - the target Avro schema for the resolver
 * @return - The Avro schema resolver used to convert messages
 *           encoded with the specified Avro schema to the local
 *           Avro schema format
 */
export declare const genCreateSchemaResolver: (opts: Options) => SchemaResolverFunc;
/**
 * Create an Avro decoder based on the specified parameters and
 * return a closure that takes an encoded Buffer and decodes it
 *
 * @param schema - the target Avro schema to which the decoded payload
 *                 should conform
 * @param createSchemaResolver - a function used to create the resolver
 *                               object that will be used to decode the payload
 * @param resolversMap - a hashmap keys on the schema ids where the value is a
 *                       promise holding a schema resolver
 * @param buffer - The Avro encoded buffer
 * @return - The Avro decoded object that conforms to the specified schema
 */
export declare const genPayloadDecoder: ({ schema, createSchemaResolver, resolversMap }: DecoderInfo) => DecodeFunc;
export declare const createDecoder: (opts: Options) => DecodeFunc;

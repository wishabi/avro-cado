import { aggregateOptions } from "../ts/util";
import { IOptions } from "./types/types";

export const ACCEPT_HEADERS: string =
  "application/vnd.schemaregistry.v1+json, application/vnd.schemaregistry+json, application/json";

const optionsDefault: IOptions = {
  schemaRegistry: "http://localhost:8081",
  numRetries: 10, // number of attempts to call schemaRegistry
  wrapUnions: "auto", // avsc option
  subject: null, // subject for schema registration
  schema: null // schema object as needed for avsc
};

/**
 * Validate the options and merge them with the default values
 *
 * @param opts - the user specified options
 * @return - merged configuration options
 */
export const processOptions = (opts: IOptions): IOptions => {
  if (!opts.subject) {
    throw new Error("subject key missing");
  }

  if (!opts.schema) {
    throw new Error("schema key missing");
  }

  // Aggregate the configuration values with defaults
  return aggregateOptions(optionsDefault, opts);
};

import { aggregateOptions } from "../ts/util";
import { Options } from "./types/types";

export const ACCEPT_HEADERS: string =
  "application/vnd.schemaregistry.v1+json, application/vnd.schemaregistry+json, application/json";

const optionsDefault: Options = {
  schemaRegistry: "http://localhost:8081",
  numRetries: 10,
  wrapUnions: "auto",
  subject: null,
  schema: null
};

/**
 * Validate the options and merge them with the default values
 *
 * @param opts - the user specified options
 * @return - merged configuration options
 */
export const processOptions = (opts: Options): Options => {
  if (!opts.subject) {
    throw new Error("subject key missing");
  }

  if (!opts.schema) {
    throw new Error("schema key missing");
  }

  // Aggregate the configuration values with defaults
  return aggregateOptions(optionsDefault, opts);
};

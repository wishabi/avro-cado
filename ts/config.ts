import { aggregateOptions } from "../ts/util";

export const ACCEPT_HEADERS: string =
  "application/vnd.schemaregistry.v1+json, application/vnd.schemaregistry+json, application/json";

const optionsDefault = {
  schemaRegistry: "http://localhost:8081",
  numRetries: 10,
  wrapUnions: "auto"
};

export const processOptions = opts => {
  if (!opts.subject) {
    throw new Error("subject key missing");
  }

  if (!opts.schema) {
    throw new Error("schema key missing");
  }

  // Aggregare the configuration values with defaults
  return aggregateOptions(optionsDefault, opts);
};

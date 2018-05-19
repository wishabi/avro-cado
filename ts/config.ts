import { aggregateOptions } from "../ts/util";
import { Logger } from "@flipp/flipp-node-logger";

export const ACCEPT_HEADERS: string =
  "application/vnd.schemaregistry.v1+json, application/vnd.schemaregistry+json, application/json";

const optionsDefault = {
  schemaRegistry: "http://localhost:8081",
  numRetries: 10,
  wrapUnions: "auto"
};

export const encodeLogger: Logger = new Logger("encodeLogger");
export const decodeLogger: Logger = new Logger("decodeLogger");

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

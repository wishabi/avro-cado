import { Options } from "../ts/types/types";
import { Logger } from "@flipp/flipp-node-logger";

export const ACCEPT_HEADERS: string =
  "application/vnd.schemaregistry.v1+json, application/vnd.schemaregistry+json, application/json";

export const optionsDefault: Options = {
  schemaRegistry: "http://localhost:8081",
  numRetries: 10,
  wrapUnions: "auto",
  subject: "DEFAULT",
  schema: null
};

export const encodeLogger: Logger = new Logger("encodeLogger");
export const decodeLogger: Logger = new Logger("decodeLogger");

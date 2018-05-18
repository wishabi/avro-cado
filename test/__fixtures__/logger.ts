import { Logger } from "@flipp/flipp-node-logger";

jest.mock("@flipp/flipp-node-logger");

export const logger: Logger = new Logger("test");

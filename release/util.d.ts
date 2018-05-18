import { Logger } from "@flipp/flipp-node-logger";
import { Options } from "./types/types";
export declare const handleError: (err: any, logger: Logger, msg: string) => boolean;
export declare const aggregateOptions: (defaultConf: Options, overrideConf: Options) => Options;

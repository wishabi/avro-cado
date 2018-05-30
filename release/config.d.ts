import { Options } from "./types/types";
export declare const ACCEPT_HEADERS: string;
/**
 * Validate the options and merge them with the default values
 *
 * @param opts - the user specified options
 * @return - merged configuration options
 */
export declare const processOptions: (opts: Options) => Options;

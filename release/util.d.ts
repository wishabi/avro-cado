import { AxiosError } from "axios";
import { IOptions } from "./types/types";
export declare const RETRY_STATUS_CODE_500 = 500;
export declare const RETRY_ERROR_CODE_50002 = 50002;
export declare const RETRY_ERROR_CODE_50003 = 50003;
/**
 * Decide whether a schema registry error is eligible to
 * be retried
 *
 * @param err - the error in question
 * @return - true iff the error is eligible for retry
 */
export declare const handleError: (err: AxiosError) => boolean;
/**
 * Merge the user specified configuration options with the
 * default ones
 *
 * @param defaultConf - the default configuration options
 * @param overrideConf - the user specified configuration options
 * @return - merged configuration options object
 */
export declare const aggregateOptions: (defaultConf: IOptions, overrideConf: IOptions) => IOptions;

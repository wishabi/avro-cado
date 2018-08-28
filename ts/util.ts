import { AxiosError } from "axios";
import { Options } from "./types/types";

export const RETRY_STATUS_CODE_500 = 500;
export const RETRY_ERROR_CODE_50002 = 50002;
export const RETRY_ERROR_CODE_50003 = 50003;

/**
 * Decide whether a schema registry error is eligible to
 * be retried
 *
 * @param err - the error in question
 * @return - true iff the error is eligible for retry
 */
export const handleError = (err: AxiosError): boolean => {
  if (
    err.response.status &&
    err.response.status === RETRY_STATUS_CODE_500 &&
    err.response.data &&
    err.response.data.error_code &&
    (err.response.data.error_code === RETRY_ERROR_CODE_50003 ||
      err.response.data.error_code === RETRY_ERROR_CODE_50002)
  ) {
    return true;
  }

  return false;
};

/**
 * Merge the user specified configuration options with the
 * default ones
 *
 * @param defaultConf - the default configuration options
 * @param overrideConf - the user specified configuration options
 * @return - merged configuration options object
 */
export const aggregateOptions = (
  defaultConf: Options,
  overrideConf: Options,
): Options => {
  const aggOptions = Object.assign({}, defaultConf, overrideConf);

  if (!overrideConf) {
    return aggOptions;
  }

  // determine how to handle unions
  const validWrapOptions: string[] = ["always", "never", "auto"];
  if (
    validWrapOptions.filter((opt) => opt === aggOptions.wrapUnions).length === 0
  ) {
    aggOptions.wrapUnions = defaultConf.wrapUnions;
  }

  return aggOptions;
};

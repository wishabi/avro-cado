import { Logger } from "@flipp/flipp-node-logger";
import * as rp from "request-promise";

export const handleError = (err: any, logger: Logger, msg: string): boolean => {
  if (err.statusCode && err.statusCode === 500) {
    if (
      err.error &&
      err.error.error_code &&
      (err.error.error_code === 50003 || err.error.error_code === 50002)
    ) {
      // retry
      logger.info(`retry ${msg}`, {
        statusCode: err.statusCode,
        errorCode: err.error.error_code,
        message: err.error.message
      });

      return true;
    }
  }

  logger.error(msg, err);
  return false;
};

export const aggregateOptions = (defaultConf, overrideConf) => {
  const aggOptions = Object.assign({}, defaultConf, overrideConf);

  if (!overrideConf) {
    return aggOptions;
  }

  // determine how to handle unions
  const validWrapOptions: Array<string> = ["always", "never", "auto"];
  if (
    validWrapOptions.filter(opt => opt === aggOptions.wrapUnions).length === 0
  ) {
    aggOptions.wrapUnions = defaultConf.wrapUnions;
  }

  return aggOptions;
};

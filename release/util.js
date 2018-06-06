"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RETRY_STATUS_CODE_500 = 500;
exports.RETRY_ERROR_CODE_50002 = 50002;
exports.RETRY_ERROR_CODE_50003 = 50003;
/**
 * Decide whether a schema registry error is eligible to
 * be retried
 *
 * @param err - the error in question
 * @return - true iff the error is eligible for retry
 */
exports.handleError = (err) => {
    if (err.statusCode &&
        err.statusCode === exports.RETRY_STATUS_CODE_500 &&
        err.error &&
        err.error.error_code &&
        (err.error.error_code === exports.RETRY_ERROR_CODE_50003 ||
            err.error.error_code === exports.RETRY_ERROR_CODE_50002)) {
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
exports.aggregateOptions = (defaultConf, overrideConf) => {
    const aggOptions = Object.assign({}, defaultConf, overrideConf);
    if (!overrideConf) {
        return aggOptions;
    }
    // determine how to handle unions
    const validWrapOptions = ["always", "never", "auto"];
    if (validWrapOptions.filter(opt => opt === aggOptions.wrapUnions).length === 0) {
        aggOptions.wrapUnions = defaultConf.wrapUnions;
    }
    return aggOptions;
};
//# sourceMappingURL=util.js.map
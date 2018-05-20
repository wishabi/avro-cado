"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = (err) => {
    if (err.statusCode && err.statusCode === 500) {
        if (err.error &&
            err.error.error_code &&
            (err.error.error_code === 50003 || err.error.error_code === 50002)) {
            return true;
        }
    }
    return false;
};
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
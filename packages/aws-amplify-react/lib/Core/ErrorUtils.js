"use strict";
//import { ErrorOptions } from './types';
Object.defineProperty(exports, "__esModule", { value: true });
// Error utils
var ErrorUtils = (function () {
    function ErrorUtils() {
    }
    ErrorUtils.prototype.error = function (err, options) {
        var ret = err;
        if (options) {
            if (options.message) {
                ret['message'] = options.message;
            }
            if (options.hints) {
                ret['message'] = ret['message'] ?
                    ret['message'] + "\nNote: " + options.hints : "Note: " + options.hints;
            }
        }
        return ret;
    };
    // method for invalid parameter type
    ErrorUtils.prototype.invalidParameterType = function (parameter, wrongType, correctType) {
        var msg = "Invalid type for parameter: " + parameter + ". Instead of using " + wrongType + " you should use " + correctType + ".";
        var typeError = new TypeError(msg);
        Error.captureStackTrace(typeError, this.invalidParameterType);
        return this.error(typeError);
    };
    ErrorUtils.prototype.invalidParameterValue = function (parameter) {
        var msg = "Invalid value for parameter: " + parameter + ".";
        var error = new Error(msg);
        Error.captureStackTrace(error, this.invalidParameterValue);
        return this.error(error);
    };
    // method for parameter out of range
    ErrorUtils.prototype.outOfRange = function (parameter, lower, upper) {
        var msg = "Invalid parameter: " + parameter + " due to out or range. It should be within " + lower + " and " + upper + ".";
        var rangeError = new RangeError(msg);
        Error.captureStackTrace(rangeError, this.outOfRange);
        return this.error(rangeError);
    };
    // method for missing parameter
    ErrorUtils.prototype.missingParameter = function (parameter) {
        var msg = "Missing parameter: " + parameter;
        var err = new Error(msg);
        Error.captureStackTrace(err, this.missingParameter);
        return this.error(err);
    };
    return ErrorUtils;
}());
exports.ErrorUtils = ErrorUtils;
var instance = new ErrorUtils();
exports.default = instance;
//# sourceMappingURL=ErrorUtils.js.map
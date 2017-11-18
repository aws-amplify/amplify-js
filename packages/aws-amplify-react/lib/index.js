"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var AWS = require("aws-sdk/global");
var Library = (function () {
    function Library() {
        AWS.config.update({ customUserAgent: 'Charlotte-js' });
    }
    Library.prototype.config = function (options) {
        this.options = options;
        AWS.config.update(__assign({}, this.options, { customUserAgent: 'Charlotte-js' }));
    };
    return Library;
}());
__export(require("./Auth"));
var instance = new Library();
exports.default = instance;
//# sourceMappingURL=index.js.map
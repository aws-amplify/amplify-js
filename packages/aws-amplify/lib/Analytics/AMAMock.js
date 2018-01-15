"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MobileAnalytics = /** @class */ (function () {
    function MobileAnalytics(object) {
    }
    MobileAnalytics.prototype.putEvents = function (params, callback) {
        var random = Math.random();
        if (random < 0.5)
            callback({ statusCode: 400, code: 'ThrottlingException' }, null);
        else
            callback(null, 'data');
    };
    return MobileAnalytics;
}());
exports.default = MobileAnalytics;
//# sourceMappingURL=AMAMock.js.map
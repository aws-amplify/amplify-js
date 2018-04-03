"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Parser = /** @class */ (function () {
    function Parser() {
    }
    Parser.parseMobilehubConfig = function (config) {
        var amplifyConfig = {};
        // Analytics
        if (config['aws_mobile_analytics_app_id']) {
            var Analytics = {};
            Analytics['appId'] = config['aws_mobile_analytics_app_id'];
            Analytics['region'] = config['aws_mobile_analytics_app_region'];
            amplifyConfig.Analytics = Analytics;
        }
        amplifyConfig.Analytics = Object.assign({}, amplifyConfig.Analytics, config.Analytics);
        return amplifyConfig;
    };
    return Parser;
}());
exports.default = Parser;
//# sourceMappingURL=Parser.js.map
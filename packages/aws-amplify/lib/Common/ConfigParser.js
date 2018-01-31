"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConfigParser = /** @class */ (function () {
    function ConfigParser() {
    }
    ConfigParser.parseMobilehubConfig = function (config) {
        var amplifyConfig = {};
        // Analytics
        if (config['aws_mobile_analytics_app_id']) {
            var Analytics = {};
            Analytics['appId'] = config['aws_mobile_analytics_app_id'];
            Analytics['region'] = config['aws_mobile_analytics_app_region'];
            amplifyConfig.Analytics = Analytics;
        }
        return amplifyConfig;
    };
    return ConfigParser;
}());
exports.default = ConfigParser;
//# sourceMappingURL=ConfigParser.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Common_1 = require("../Common");
var logger = new Common_1.ConsoleLogger('Parser');
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
        // Credentials
        if (config['aws_cognito_identity_pool_id']) {
            var Credentials = {};
            Credentials['cognitoIdentityPoolId'] = config['aws_cognito_identity_pool_id'];
            Credentials['cognitoRegion'] = config['aws_cognito_region'];
            Credentials['cognitoUserPoolId'] = config['aws_user_pools_id'];
            amplifyConfig.Credentials = Credentials;
        }
        amplifyConfig.Analytics = Object.assign({}, amplifyConfig.Analytics, config.Analytics);
        amplifyConfig.Credentials = Object.assign({}, amplifyConfig.Credentials, config.Credentials);
        logger.debug('parse config', config, 'to amplifyconfig', amplifyConfig);
        return amplifyConfig;
    };
    return Parser;
}());
exports.default = Parser;
//# sourceMappingURL=Parser.js.map
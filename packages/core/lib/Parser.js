'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var Logger_1 = require('./Logger');
var logger = new Logger_1.ConsoleLogger('Parser');
var Parser = /** @class */ (function() {
	function Parser() {}
	Parser.parseMobilehubConfig = function(config) {
		var amplifyConfig = {};
		// Analytics
		if (config['aws_mobile_analytics_app_id']) {
			var Analytics = {
				AWSPinpoint: {
					appId: config['aws_mobile_analytics_app_id'],
					region: config['aws_mobile_analytics_app_region'],
				},
			};
			amplifyConfig.Analytics = Analytics;
		}
		// Auth
		if (config['aws_cognito_identity_pool_id'] || config['aws_user_pools_id']) {
			var Auth = {
				userPoolId: config['aws_user_pools_id'],
				userPoolWebClientId: config['aws_user_pools_web_client_id'],
				region: config['aws_cognito_region'],
				identityPoolId: config['aws_cognito_identity_pool_id'],
				identityPoolRegion: config['aws_cognito_region'],
				mandatorySignIn:
					config['aws_mandatory_sign_in'] === 'enable' ? true : false,
			};
			amplifyConfig.Auth = Auth;
		}
		// Storage
		var storageConfig;
		if (config['aws_user_files_s3_bucket']) {
			storageConfig = {
				AWSS3: {
					bucket: config['aws_user_files_s3_bucket'],
					region: config['aws_user_files_s3_bucket_region'],
					dangerouslyConnectToHttpEndpointForTesting:
						config[
							'aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing'
						],
				},
			};
		} else {
			storageConfig = config ? config.Storage || config : {};
		}
		amplifyConfig.Analytics = Object.assign(
			{},
			amplifyConfig.Analytics,
			config.Analytics
		);
		amplifyConfig.Auth = Object.assign({}, amplifyConfig.Auth, config.Auth);
		amplifyConfig.Storage = Object.assign({}, storageConfig);
		logger.debug('parse config', config, 'to amplifyconfig', amplifyConfig);
		return amplifyConfig;
	};
	return Parser;
})();
exports.default = Parser;
//# sourceMappingURL=Parser.js.map

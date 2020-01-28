'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
/**
 * RestClient instance options
 */
var RestClientOptions = /** @class */ (function() {
	function RestClientOptions() {
		this.credentials_key = 'awsCredentials';
		this.headers = {};
	}
	return RestClientOptions;
})();
exports.RestClientOptions = RestClientOptions;
/**
 * AWS credentials needed for RestClient
 */
var AWSCredentials = /** @class */ (function() {
	function AWSCredentials() {}
	return AWSCredentials;
})();
exports.AWSCredentials = AWSCredentials;
var GRAPHQL_AUTH_MODE;
(function(GRAPHQL_AUTH_MODE) {
	GRAPHQL_AUTH_MODE['API_KEY'] = 'API_KEY';
	GRAPHQL_AUTH_MODE['AWS_IAM'] = 'AWS_IAM';
	GRAPHQL_AUTH_MODE['OPENID_CONNECT'] = 'OPENID_CONNECT';
	GRAPHQL_AUTH_MODE['AMAZON_COGNITO_USER_POOLS'] = 'AMAZON_COGNITO_USER_POOLS';
})(
	(GRAPHQL_AUTH_MODE =
		exports.GRAPHQL_AUTH_MODE || (exports.GRAPHQL_AUTH_MODE = {}))
);
//# sourceMappingURL=index.js.map

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
export { RestClientOptions };
/**
 * AWS credentials needed for RestClient
 */
var AWSCredentials = /** @class */ (function() {
	function AWSCredentials() {}
	return AWSCredentials;
})();
export { AWSCredentials };
export var GRAPHQL_AUTH_MODE;
(function(GRAPHQL_AUTH_MODE) {
	GRAPHQL_AUTH_MODE['API_KEY'] = 'API_KEY';
	GRAPHQL_AUTH_MODE['AWS_IAM'] = 'AWS_IAM';
	GRAPHQL_AUTH_MODE['OPENID_CONNECT'] = 'OPENID_CONNECT';
	GRAPHQL_AUTH_MODE['AMAZON_COGNITO_USER_POOLS'] = 'AMAZON_COGNITO_USER_POOLS';
})(GRAPHQL_AUTH_MODE || (GRAPHQL_AUTH_MODE = {}));
//# sourceMappingURL=index.js.map

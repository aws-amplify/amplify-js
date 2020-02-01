const DEFAULT_USER_AGENT = 'amazon-cognito-identity-js';
// constructor
function UserAgent() {}
// public
UserAgent.prototype.userAgent = DEFAULT_USER_AGENT;

export const appendToCognitoUserAgent = content => {
	if (!content) {
		return;
	}
	if (
		UserAgent.prototype.userAgent &&
		!UserAgent.prototype.userAgent.includes(content)
	) {
		UserAgent.prototype.userAgent = UserAgent.prototype.userAgent.concat(
			' ',
			content
		);
	}
	if (!UserAgent.prototype.userAgent || UserAgent.prototype.userAgent === '') {
		UserAgent.prototype.userAgent = content;
	}
};

// class for defining the amzn user-agent
export default UserAgent;

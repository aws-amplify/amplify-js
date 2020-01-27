// class for defining the amzn user-agent
export default UserAgent;
// constructor
function UserAgent() {}
// public
UserAgent.prototype.userAgent = '';

export const appendToCognitoUserAgent = content => {
	if (content) {
		if (
			!UserAgent.prototype.userAgent ||
			UserAgent.prototype.userAgent === ''
		) {
			UserAgent.prototype.userAgent = content;
		} else {
			UserAgent.prototype.userAgent = UserAgent.prototype.userAgent.concat(
				' ',
				content
			);
		}
	}
};

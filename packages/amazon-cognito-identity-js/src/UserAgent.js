import { getUserAgent } from './Platform';
import { detectFramework } from './Platform/detectFramework';

// constructor
function UserAgent() {}
// public
UserAgent.prototype.userAgent = getUserAgent();

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
export const getAmplifyUserAgent = customUserAgent => {
	return `${UserAgent.prototype.userAgent} ${buildUserAgentDetails(
		customUserAgent
	)}`;
};

const buildUserAgentDetails = customUserAgent => {
	const { packageDetails, ...userAgentDetails } = {
		framework: detectFramework(),
		...customUserAgent,
	};
	return `${packageDetails ? `${packageDetails} ` : ''}(${Object.values(
		userAgentDetails
	).sort()})`;
};

export default UserAgent;

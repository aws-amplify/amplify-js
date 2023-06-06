import {
	AnalyticsAction,
	Category,
	getAmplifyUserAgent,
	getAmplifyUserAgentString,
} from '@aws-amplify/core';

const userAgentDetails = {
	category: Category.Analytics,
	action: AnalyticsAction.Record,
} as const;

export function getAnalyticsUserAgent() {
	return getAmplifyUserAgent(userAgentDetails);
}

export function getAnalyticsUserAgentString() {
	return getAmplifyUserAgentString(userAgentDetails);
}

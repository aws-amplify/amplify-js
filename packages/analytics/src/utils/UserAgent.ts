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

export function getAnalyticsUserAgent(action: AnalyticsAction) {
	return getAmplifyUserAgent(userAgentDetails);
}

export function getAnalyticsUserAgentString(action: AnalyticsAction) {
	return getAmplifyUserAgentString(userAgentDetails);
}

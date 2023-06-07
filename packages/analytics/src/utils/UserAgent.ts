import {
	AnalyticsAction,
	Category,
	getAmplifyUserAgent,
	getAmplifyUserAgentString,
} from '@aws-amplify/core';

export function getAnalyticsUserAgent(action: AnalyticsAction) {
	return getAmplifyUserAgent({
		category: Category.Analytics,
		action,
	});
}

export function getAnalyticsUserAgentString(action: AnalyticsAction) {
	return getAmplifyUserAgentString({
		category: Category.Analytics,
		action,
	});
}

import {
	AnalyticsAction,
	Category,
	getAmplifyUserAgent,
} from '@aws-amplify/core';

export function getAnalyticsUserAgent() {
	return getAmplifyUserAgent({
		category: Category.Analytics,
		action: AnalyticsAction.Record,
	});
}

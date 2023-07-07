// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AnalyticsAction,
	Category,
	getAmplifyUserAgentObject,
	getAmplifyUserAgent,
} from '@aws-amplify/core';

export function getAnalyticsUserAgent(action: AnalyticsAction) {
	return getAmplifyUserAgentObject({
		category: Category.Analytics,
		action,
	});
}

export function getAnalyticsUserAgentString(action: AnalyticsAction) {
	return getAmplifyUserAgent({
		category: Category.Analytics,
		action,
	});
}

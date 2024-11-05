// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AnalyticsAction,
	Category,
	getAmplifyUserAgent,
	getAmplifyUserAgentObject,
} from '@aws-amplify/core/internals/utils';
import { UserAgent } from '@aws-sdk/types';

export function getAnalyticsUserAgent(action: AnalyticsAction): UserAgent {
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

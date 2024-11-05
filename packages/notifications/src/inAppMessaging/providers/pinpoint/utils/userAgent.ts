// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	Category,
	InAppMessagingAction,
	getAmplifyUserAgent,
	getAmplifyUserAgentObject,
} from '@aws-amplify/core/internals/utils';
import { UserAgent } from '@aws-sdk/types';

export function getInAppMessagingUserAgent(
	action: InAppMessagingAction,
): UserAgent {
	return getAmplifyUserAgentObject({
		category: Category.InAppMessaging,
		action,
	});
}

export function getInAppMessagingUserAgentString(action: InAppMessagingAction) {
	return getAmplifyUserAgent({
		category: Category.InAppMessaging,
		action,
	});
}

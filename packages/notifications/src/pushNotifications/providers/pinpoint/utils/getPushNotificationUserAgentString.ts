// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	PushNotificationAction,
	Category,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';

export function getPushNotificationUserAgentString(
	action: PushNotificationAction
) {
	return getAmplifyUserAgent({
		category: Category.PushNotification,
		action,
	});
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	Category,
	PushNotificationAction,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';

export const getPushNotificationUserAgentString = (
	action: PushNotificationAction,
) =>
	getAmplifyUserAgent({
		category: Category.PushNotification,
		action,
	});

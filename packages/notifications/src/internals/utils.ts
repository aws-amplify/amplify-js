// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Category,
	CustomUserAgentDetails,
	getAmplifyUserAgent,
	InAppMessagingAction,
} from '@aws-amplify/core';

export const getUserAgentValue = (
	action: InAppMessagingAction,
	customUserAgentDetails?: CustomUserAgentDetails
) => {
	return getAmplifyUserAgent({
		category: Category.InAppMessaging,
		action,
		...customUserAgentDetails,
	});
};

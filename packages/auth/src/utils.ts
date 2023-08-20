// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthAction,
	Category,
	CustomUserAgentDetails,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/library-utils';

export function getAuthUserAgentValue(
	action: AuthAction,
	customUserAgentDetails?: CustomUserAgentDetails
) {
	return getAmplifyUserAgent({
		category: Category.Auth,
		action,
		...customUserAgentDetails,
	});
}

export function getAuthUserAgentDetails(
	action: AuthAction,
	customUserAgentDetails?: CustomUserAgentDetails
): CustomUserAgentDetails {
	return { category: Category.Auth, action, ...customUserAgentDetails };
}

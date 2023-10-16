// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthAction,
	Category,
	CustomUserAgentDetails,
} from '@aws-amplify/core/internals/utils';

export const getAuthUserAgentDetails = (
	action: AuthAction,
	customUserAgentDetails?: CustomUserAgentDetails
): CustomUserAgentDetails => ({
	category: Category.Auth,
	action,
	...customUserAgentDetails,
});

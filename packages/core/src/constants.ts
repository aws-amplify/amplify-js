// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Logging constants
export const AWS_CLOUDWATCH_CATEGORY = 'Logging';

export const USER_AGENT_HEADER = 'x-amz-user-agent';

// Error exception code constants
export const NO_HUBCALLBACK_PROVIDED_EXCEPTION =
	'NoHubcallbackProvidedException';

// User Agents Override Symbol
export const INTERNAL_USER_AGENT_OVERRIDE =
	typeof Symbol !== 'undefined'
		? Symbol('INTERNAL_USER_AGENT_OVERRIDE')
		: '@@INTERNAL_USER_AGENT_OVERRIDE';

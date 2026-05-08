// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

/**
 * Use Symbol.for directly to match the runtime brand check in isAmplifyContext,
 * since jest.mock('@aws-amplify/core') would make the imported AMPLIFY_CONTEXT_BRAND undefined.
 */
const AMPLIFY_CONTEXT_BRAND = Symbol.for('amplify.context');

export function createMockAmplifyContext(
	resourcesConfig: Record<string, unknown> = {},
	fetchAuthSessionValue: Record<string, unknown> = {},
): AmplifyContext {
	return {
		[AMPLIFY_CONTEXT_BRAND]: true,
		resourcesConfig,
		libraryOptions: {},
		fetchAuthSession: jest.fn().mockResolvedValue(fetchAuthSessionValue),
		clearCredentials: jest.fn().mockResolvedValue(undefined),
		getTokens: jest.fn().mockResolvedValue(undefined),
	} as unknown as AmplifyContext;
}

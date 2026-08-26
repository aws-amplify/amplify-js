// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AMPLIFY_CONTEXT_BRAND,
	AmplifyContext,
	ResourcesConfig,
} from '@aws-amplify/core';

/**
 * Creates a mock AmplifyContext for testing.
 * Accepts partial/incomplete configs to test error paths.
 */
export function createMockAmplifyContext(
	resourcesConfig?: Partial<ResourcesConfig>,
): AmplifyContext {
	const ctx: AmplifyContext = {
		resourcesConfig: (resourcesConfig || {}) as ResourcesConfig,
		libraryOptions: {},
		fetchAuthSession: jest.fn().mockResolvedValue({}),
		clearCredentials: jest.fn().mockResolvedValue(undefined),
		getTokens: jest.fn().mockResolvedValue(undefined),
	};

	Object.defineProperty(ctx, AMPLIFY_CONTEXT_BRAND, {
		value: true,
		enumerable: false,
	});

	return ctx;
}

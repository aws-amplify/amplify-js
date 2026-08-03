// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AMPLIFY_CONTEXT_BRAND,
	AmplifyContext,
	ResourcesConfig,
} from '@aws-amplify/core';

export interface MockAmplifyContextOptions {
	/** When provided, resourcesConfig becomes a live getter delegating to this fn. */
	getConfig?(): ResourcesConfig;
}

/**
 * Creates a mock AmplifyContext for testing.
 */
export function createMockAmplifyContext(
	resourcesConfigOrOpts?: ResourcesConfig | MockAmplifyContextOptions,
): AmplifyContext {
	// Determine whether we received the options form or raw ResourcesConfig.
	const isOpts =
		resourcesConfigOrOpts != null &&
		'getConfig' in resourcesConfigOrOpts &&
		typeof (resourcesConfigOrOpts as MockAmplifyContextOptions).getConfig ===
			'function';

	const ctx: AmplifyContext = {
		// Use a live getter when getConfig is supplied so per-test config changes propagate.
		get resourcesConfig() {
			if (isOpts) {
				return (resourcesConfigOrOpts as MockAmplifyContextOptions)
					.getConfig!();
			}

			return (resourcesConfigOrOpts as ResourcesConfig) ?? {};
		},
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

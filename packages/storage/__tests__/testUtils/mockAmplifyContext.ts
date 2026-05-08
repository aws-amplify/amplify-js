// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, ResourcesConfig } from '@aws-amplify/core';

const AMPLIFY_CONTEXT_BRAND = Symbol.for('amplify.context');

/**
 * Creates a branded mock AmplifyContext for testing.
 * The brand ensures `isAmplifyContext()` returns true,
 * which is required for `resolveCtxArgs()` to recognize it.
 */
export function createMockAmplifyContext(
	resourcesConfig: ResourcesConfig = {},
): AmplifyContext {
	const ctx: AmplifyContext = {
		resourcesConfig,
		libraryOptions: {},
		fetchAuthSession: jest.fn().mockResolvedValue({}),
		clearCredentials: jest.fn().mockResolvedValue(undefined),
		getTokens: jest.fn().mockResolvedValue(undefined),
	};

	Object.defineProperty(ctx, AMPLIFY_CONTEXT_BRAND, {
		value: true,
		enumerable: false,
		configurable: false,
		writable: false,
	});

	return ctx;
}

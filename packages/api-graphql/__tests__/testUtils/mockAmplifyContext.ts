// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyContext,
	LibraryOptions,
	ResourcesConfig,
} from '@aws-amplify/core';

/**
 * A mutable version of AmplifyContext for use in tests that need to
 * reassign resourcesConfig or libraryOptions in beforeAll/beforeEach.
 */
export type MockAmplifyContext = {
	-readonly [K in keyof AmplifyContext]: AmplifyContext[K];
};

/**
 * Creates a mock AmplifyContext for testing.
 */
export function createMockAmplifyContext(
	resourcesConfig: ResourcesConfig = {},
	libraryOptions: LibraryOptions = {},
): MockAmplifyContext {
	return {
		resourcesConfig,
		libraryOptions,
		fetchAuthSession: jest.fn().mockResolvedValue({}),
		clearCredentials: jest.fn().mockResolvedValue(undefined),
		getTokens: jest.fn().mockResolvedValue(undefined),
	};
}

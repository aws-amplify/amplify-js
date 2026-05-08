// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AMPLIFY_CONTEXT_BRAND, AmplifyContext } from '@aws-amplify/core';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

export const mockAmplifyCtx: AmplifyContext = (() => {
	const ctx: AmplifyContext = {
		resourcesConfig: {},
		libraryOptions: {},
		fetchAuthSession: jest.fn().mockResolvedValue({
			credentials: {
				accessKeyId: 'access-key-id',
				secretAccessKey: 'secret-access-key',
				sessionToken: 'session-token',
			},
			identityId: 'identity-id',
		}),
		clearCredentials: jest.fn(),
		getTokens: jest.fn(),
	};

	Object.defineProperty(ctx, AMPLIFY_CONTEXT_BRAND, {
		value: true,
		enumerable: false,
	});

	return ctx;
})();

export function setupGlobalContext() {
	setGlobalContext(mockAmplifyCtx);
}

export function teardownGlobalContext() {
	clearGlobalContext();
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AMPLIFY_CONTEXT_BRAND, AmplifyContext } from '@aws-amplify/core';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

export const mockAmplifyCtx = {
	[AMPLIFY_CONTEXT_BRAND]: true,
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
} as unknown as AmplifyContext;

export function setupGlobalContext() {
	setGlobalContext(mockAmplifyCtx);
}

export function teardownGlobalContext() {
	clearGlobalContext();
}

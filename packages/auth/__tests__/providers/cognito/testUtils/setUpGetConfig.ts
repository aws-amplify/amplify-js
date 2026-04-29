// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

const defaultConfig = {
	Auth: {
		Cognito: {
			userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			userPoolId: 'us-west-2_zzzzz',
			identityPoolId: 'us-west-2:xxxxxx',
		},
	},
};

export const setUpGetConfig = (mockAmplify: any) => {
	mockAmplify.getConfig.mockReturnValue(defaultConfig);

	const mockCtx: AmplifyContext = {
		get resourcesConfig() {
			return mockAmplify.getConfig();
		},
		get libraryOptions() {
			return mockAmplify.libraryOptions ?? {};
		},
		fetchAuthSession(...args: any[]) {
			// Delegate to the mocked fetchAuthSession from @aws-amplify/core
			// so that per-test mockFetchAuthSession.mockResolvedValue() works.

			const core = require('@aws-amplify/core');

			return core.fetchAuthSession(...args);
		},
		clearCredentials: jest.fn().mockResolvedValue(undefined),
		getTokens(...args: any[]) {
			// Delegate to the mocked Amplify.Auth.getTokens from @aws-amplify/core

			const core = require('@aws-amplify/core');

			return (
				core.Amplify?.Auth?.getTokens?.(...args) ?? Promise.resolve(undefined)
			);
		},
	};
	setGlobalContext(mockCtx);
};

export const tearDownGetConfig = () => {
	clearGlobalContext();
};

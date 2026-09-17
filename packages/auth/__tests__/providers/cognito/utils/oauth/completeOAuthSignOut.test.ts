// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub, clearCredentials } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { tokenOrchestrator as globalTokenOrchestrator } from '../../../../../src/providers/cognito/tokenProvider/tokenProvider';
import { completeOAuthSignOut } from '../../../../../src/providers/cognito/utils/oauth/completeOAuthSignOut';
import { DefaultOAuthStore } from '../../../../../src/providers/cognito/utils/signInWithRedirectStore';
import type { TokenOrchestrator } from '../../../../../src/providers/cognito/tokenProvider/TokenOrchestrator';

jest.mock('@aws-amplify/core', () => {
	return {
		...(jest.genMockFromModule('@aws-amplify/core') as object),
		// must do this as auth tests import `signInWithRedirect`
		Amplify: {
			getConfig: jest.fn().mockReturnValue({}),
		},
	};
});
jest.mock('../../../../../src/providers/cognito/tokenProvider/tokenProvider');

describe('completeOAuthSignOut', () => {
	// assert mocks
	const mockGlobalClearCredentials = clearCredentials as jest.Mock;
	const mockGlobalTokenOrchestrator = globalTokenOrchestrator as jest.Mocked<
		typeof globalTokenOrchestrator
	>;
	const mockHub = Hub as jest.Mocked<typeof Hub>;

	// create mocks
	const mockStore = {
		clearOAuthData: jest.fn(),
	} as unknown as jest.Mocked<DefaultOAuthStore>;
	const mockTokenOrchestrator = {
		clearTokens: jest.fn(),
	} as unknown as jest.Mocked<TokenOrchestrator>;
	const mockClearCredentials = jest.fn();

	afterEach(() => {
		mockStore.clearOAuthData.mockClear();
		mockTokenOrchestrator.clearTokens.mockClear();
		mockClearCredentials.mockClear();
		mockGlobalClearCredentials.mockClear();
		mockGlobalTokenOrchestrator.clearTokens.mockClear();
		mockHub.dispatch.mockClear();
	});

	it('should complete OAuth sign out', async () => {
		await completeOAuthSignOut(
			mockStore,
			mockTokenOrchestrator,
			mockClearCredentials,
		);

		expect(mockStore.clearOAuthData).toHaveBeenCalledTimes(1);
		expect(mockTokenOrchestrator.clearTokens).toHaveBeenCalledTimes(1);
		expect(mockClearCredentials).toHaveBeenCalledTimes(1);
		expect(mockHub.dispatch).toHaveBeenCalledWith(
			'auth',
			{ event: 'signedOut' },
			'Auth',
			AMPLIFY_SYMBOL,
		);
	});

	it('should clear through the passed handles, not the global singletons', async () => {
		await completeOAuthSignOut(
			mockStore,
			mockTokenOrchestrator,
			mockClearCredentials,
		);

		expect(mockGlobalTokenOrchestrator.clearTokens).not.toHaveBeenCalled();
		expect(mockGlobalClearCredentials).not.toHaveBeenCalled();
	});
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { clearCredentials, Hub } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';
import { tokenOrchestrator } from '../../../../../src/providers/cognito/tokenProvider/tokenProvider';
import { completeOAuthSignOut } from '../../../../../src/providers/cognito/utils/oauth/completeOAuthSignOut';
import { DefaultOAuthStore } from '../../../../../src/providers/cognito/utils/signInWithRedirectStore';

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
	const mockClearCredentials = clearCredentials as jest.Mock;
	const mockHub = Hub as jest.Mocked<typeof Hub>;
	const mockTokenOrchestrator = tokenOrchestrator as jest.Mocked<
		typeof tokenOrchestrator
	>;

	// create mocks
	const mockStore = {
		clearOAuthData: jest.fn(),
	} as unknown as jest.Mocked<DefaultOAuthStore>;

	afterEach(() => {
		mockStore.clearOAuthData.mockClear();
		mockClearCredentials.mockClear();
		mockHub.dispatch.mockClear();
		mockTokenOrchestrator.clearTokens.mockClear();
	});

	it('should complete OAuth sign out', async () => {
		await completeOAuthSignOut(mockStore);

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
});

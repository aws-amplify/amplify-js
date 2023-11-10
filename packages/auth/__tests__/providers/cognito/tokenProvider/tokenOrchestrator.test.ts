// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { tokenOrchestrator } from '../../../../src/providers/cognito/tokenProvider';
import { CognitoAuthTokens } from '../../../../src/providers/cognito/tokenProvider/types';

jest.mock('@aws-amplify/core/internals/utils');
jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	Hub: {
		dispatch: jest.fn(),
	},
}));

const mockAssertTokenProviderConfig = assertTokenProviderConfig as jest.Mock;

describe('tokenOrchestrator', () => {
	const mockTokenRefresher = jest.fn();
	const mockTokenStore = {
		storeTokens: jest.fn(),
		getLastAuthUser: jest.fn(),
		loadTokens: jest.fn(),
		clearTokens: jest.fn(),
		setKeyValueStorage: jest.fn(),
		getDeviceMetadata: jest.fn(),
		clearDeviceMetadata: jest.fn(),
	};

	beforeAll(() => {
		tokenOrchestrator.setTokenRefresher(mockTokenRefresher);
		tokenOrchestrator.setAuthTokenStore(mockTokenStore);
	});

	describe('refreshTokens method', () => {
		it('calls the set tokenRefresher, tokenStore and Hub while refreshing tokens', async () => {
			const testUsername = 'username';
			const testInputTokens = {
				accessToken: {
					payload: {},
				},
				clockDrift: 400000,
				username: testUsername,
			};

			const mockTokens: CognitoAuthTokens = {
				accessToken: {
					payload: {},
				},
				clockDrift: 300,
				username: testUsername,
			};
			mockTokenRefresher.mockResolvedValueOnce(mockTokens);
			mockTokenStore.storeTokens.mockResolvedValue(void 0);
			const newTokens = await tokenOrchestrator['refreshTokens']({
				tokens: testInputTokens,
				username: testUsername,
			});

			// ensure the underlying async operations to be completed
			// async #1
			expect(mockTokenRefresher).toHaveBeenCalledWith(
				expect.objectContaining({
					tokens: testInputTokens,
					username: testUsername,
				})
			);
			// async #2
			expect(mockTokenStore.storeTokens).toHaveBeenCalledWith(mockTokens);

			// ensure the result is correct
			expect(newTokens).toEqual(mockTokens);
		});
	});
});

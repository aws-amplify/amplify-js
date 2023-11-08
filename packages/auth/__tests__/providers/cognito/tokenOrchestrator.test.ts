// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TokenOrchestrator } from '../../../src/providers/cognito';
import { Hub, ResourcesConfig } from '@aws-amplify/core';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';
jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	Hub: {
		dispatch: jest.fn(),
		listen: jest.fn(),
	},
}));

const mockAuthTokenStore = {
	getLastAuthUser: jest.fn(),
	loadTokens: jest.fn(),
	storeTokens: jest.fn(),
	clearTokens: jest.fn(),
	setKeyValueStorage: jest.fn(),
	getDeviceMetadata: jest.fn(),
	clearDeviceMetadata: jest.fn(),
};
const mockTokenRefresher = jest.fn();
const validAuthConfig: ResourcesConfig = {
	Auth: {
		Cognito: {
			userPoolId: 'us-east-1_test-id',
			identityPoolId: 'us-east-1:test-id',
			userPoolClientId: 'test-id',
			allowGuestAccess: true,
		},
	},
};

describe('TokenOrchestrator', () => {
	const tokenOrchestrator = new TokenOrchestrator();
	describe('Happy Path Cases:', () => {
		beforeAll(() => {
			tokenOrchestrator.setAuthConfig(validAuthConfig.Auth!);
			tokenOrchestrator.setAuthTokenStore(mockAuthTokenStore);
			tokenOrchestrator.setTokenRefresher(mockTokenRefresher);
			mockAuthTokenStore.getLastAuthUser.mockResolvedValue('test-username');
		});
		it('Should get tokens', async () => {
			mockAuthTokenStore.loadTokens.mockResolvedValue(
				authAPITestParams.ValidAuthTokens
			);

			const tokensRes = await tokenOrchestrator.getTokens();
			expect(tokensRes).toEqual({
				accessToken: authAPITestParams.ValidAuthTokens.accessToken,
				idToken: authAPITestParams.ValidAuthTokens.idToken,
				signInDetails: undefined,
			});
		});
		it('Should call tokenRefresher and return valid tokens', async () => {
			mockAuthTokenStore.loadTokens.mockResolvedValue(
				authAPITestParams.ExpiredAuthTokens
			);
			mockTokenRefresher.mockResolvedValue(authAPITestParams.ValidAuthTokens);
			const tokensRes = await tokenOrchestrator.getTokens();
			expect(tokensRes).toEqual({
				accessToken: authAPITestParams.ValidAuthTokens.accessToken,
				idToken: authAPITestParams.ValidAuthTokens.idToken,
				signInDetails: undefined,
			});
			expect(Hub.dispatch).toHaveBeenCalledWith(
				'auth',
				{ event: 'tokenRefresh' },
				'Auth',
				AMPLIFY_SYMBOL
			);
		});
	});
});

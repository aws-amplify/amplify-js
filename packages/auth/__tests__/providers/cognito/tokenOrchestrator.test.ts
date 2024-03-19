// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { TokenOrchestrator } from '../../../src/providers/cognito';
import { Hub, ResourcesConfig } from '@aws-amplify/core';
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

const currentDate = new Date();

const expiredDate = new Date();
expiredDate.setDate(currentDate.getDate() - 5);
const expiredDateInSeconds = Math.floor(expiredDate.getTime() / 1000);

const futureDate = new Date();
futureDate.setDate(currentDate.getDate() + 5);
const futureDateInSeconds = Math.floor(futureDate.getTime() / 1000);

const expiredAuthTokens = {
	idToken: {
		payload: {
			sub: '1234567890',
			name: 'John Doe',
			iat: 1516239022,
			exp: expiredDateInSeconds,
		},
	},
	accessToken: {
		payload: {
			sub: '1234567890',
			name: 'John Doe',
			iat: 1516239022,
			exp: expiredDateInSeconds,
		},
	},
	accessTokenExpAt: expiredDate,
	clockDrift: undefined,
	metadata: undefined,
};

const validAuthTokens = {
	idToken: {
		payload: {
			sub: '1234567890',
			name: 'John Doe the second',
			iat: 1516239022,
			iss: 'https://test.com',
			exp: futureDateInSeconds,
		},
	},
	accessToken: {
		payload: {
			sub: '1234567890',
			name: 'John Doe the second',
			iat: 1516239022,
			iss: 'https://test.com',
			exp: futureDateInSeconds,
		},
	},
	accessTokenExpAt: futureDate,
	clockDrift: undefined,
	metadata: undefined,
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
			mockAuthTokenStore.loadTokens.mockResolvedValue(validAuthTokens);

			const tokensRes = await tokenOrchestrator.getTokens();
			expect(tokensRes).toEqual({
				accessToken: validAuthTokens.accessToken,
				idToken: validAuthTokens.idToken,
				signInDetails: undefined,
			});
		});
		it('Should call tokenRefresher and return valid tokens', async () => {
			mockAuthTokenStore.loadTokens.mockResolvedValue(expiredAuthTokens);
			mockTokenRefresher.mockResolvedValue(validAuthTokens);
			const tokensRes = await tokenOrchestrator.getTokens();
			expect(tokensRes).toEqual({
				accessToken: validAuthTokens.accessToken,
				idToken: validAuthTokens.idToken,
				signInDetails: undefined,
			});
			expect(Hub.dispatch).toHaveBeenCalledWith(
				'auth',
				{ event: 'tokenRefresh' },
				'Auth',
				AMPLIFY_SYMBOL,
			);
		});
	});
});

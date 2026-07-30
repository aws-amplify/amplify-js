// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub, ResourcesConfig } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { TokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import {
	addInflightPromise,
	resolveAndClearInflightPromises,
} from '../../../src/providers/cognito/utils/oauth/inflightPromise';
import { oAuthStore } from '../../../src/providers/cognito/utils/oauth';

jest.mock('../../../src/providers/cognito/utils/oauth/oAuthStore');
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
	setOAuthMetadata: jest.fn(),
	getOAuthMetadata: jest.fn(),
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

jest.mock('../../../src/providers/cognito/utils/oauth/inflightPromise', () => ({
	addInflightPromise: jest.fn(),
	resolveAndClearInflightPromises: jest.fn(),
}));

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

const mockAddInflightPromise = addInflightPromise as jest.Mock;

describe('TokenOrchestrator', () => {
	const tokenOrchestrator = new TokenOrchestrator();
	describe('Happy Path Cases:', () => {
		beforeAll(() => {
			mockAddInflightPromise.mockImplementation(resolver => {
				resolver();
			});
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

		it('Should call addInflightPromise when OAuth is inflight', async () => {
			mockAuthTokenStore.loadTokens.mockResolvedValue(validAuthTokens);
			(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValue(true);

			const tokens = await tokenOrchestrator.getTokens();

			expect(addInflightPromise).toHaveBeenCalledWith(expect.any(Function));
			expect(tokens?.accessToken).toEqual(validAuthTokens.accessToken);
		});
	});

	describe('inflight OAuth timeout', () => {
		const INFLIGHT_OAUTH_TIMEOUT_MS = 60_000;
		let orchestrator: TokenOrchestrator;

		beforeEach(() => {
			jest.useFakeTimers({ doNotFake: ['nextTick'] });
			jest.clearAllMocks();
			// never resolved externally: simulates a cancelled native sign-in sheet
			mockAddInflightPromise.mockImplementation(() => undefined);
			(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValue(true);
			(oAuthStore.clearOAuthInflightData as jest.Mock).mockResolvedValue(
				undefined,
			);
			mockAuthTokenStore.loadTokens.mockResolvedValue(null);
			mockAuthTokenStore.getLastAuthUser.mockResolvedValue('test-username');
			orchestrator = new TokenOrchestrator();
			orchestrator.setAuthConfig(validAuthConfig.Auth!);
			orchestrator.setAuthTokenStore(mockAuthTokenStore);
			orchestrator.setTokenRefresher(mockTokenRefresher);
		});

		afterEach(() => {
			jest.useRealTimers();
		});

		it('does not settle the inflight wait before the timeout elapses', async () => {
			let settled = false;
			const wait = orchestrator.waitForInflightOAuth().then(() => {
				settled = true;
			});

			await Promise.resolve();
			jest.advanceTimersByTime(INFLIGHT_OAUTH_TIMEOUT_MS - 1);
			await new Promise(resolve => {
				process.nextTick(resolve);
			});

			expect(settled).toBe(false);
			expect(oAuthStore.clearOAuthInflightData).not.toHaveBeenCalled();

			jest.advanceTimersByTime(1);
			await wait;
			expect(settled).toBe(true);
		});

		it('clears the persisted inflight flag and settles waiters on timeout', async () => {
			const wait = orchestrator.waitForInflightOAuth();

			await new Promise(resolve => {
				process.nextTick(resolve);
			});
			jest.advanceTimersByTime(INFLIGHT_OAUTH_TIMEOUT_MS);

			await expect(wait).resolves.toBeUndefined();
			expect(oAuthStore.clearOAuthInflightData).toHaveBeenCalledTimes(1);
			expect(resolveAndClearInflightPromises).toHaveBeenCalledTimes(1);
		});

		it('getTokens returns no session on timeout instead of hanging', async () => {
			const tokensPromise = orchestrator.getTokens();

			await new Promise(resolve => {
				process.nextTick(resolve);
			});
			jest.advanceTimersByTime(INFLIGHT_OAUTH_TIMEOUT_MS);

			await expect(tokensPromise).resolves.toBeNull();
			expect(oAuthStore.clearOAuthInflightData).toHaveBeenCalledTimes(1);
		});

		it('does not clear inflight data when the OAuth flow completes normally', async () => {
			mockAddInflightPromise.mockImplementation(resolver => {
				resolver();
			});
			mockAuthTokenStore.loadTokens.mockResolvedValue(validAuthTokens);

			const tokens = await orchestrator.getTokens();

			expect(tokens?.accessToken).toEqual(validAuthTokens.accessToken);

			jest.advanceTimersByTime(INFLIGHT_OAUTH_TIMEOUT_MS * 2);
			await new Promise(resolve => {
				process.nextTick(resolve);
			});

			expect(oAuthStore.clearOAuthInflightData).not.toHaveBeenCalled();
			expect(jest.getTimerCount()).toBe(0);
		});
	});

	describe('setClientMetadataProvider', () => {
		it('should use clientMetadataProvider for token refresh', async () => {
			const clientMetadata = { 'app-version': '1.0.0' };
			const clientMetadataProvider = () => Promise.resolve(clientMetadata);

			mockTokenRefresher.mockResolvedValue({
				accessToken: { payload: {} },
				idToken: { payload: {} },
				clockDrift: 0,
				refreshToken: 'newRefreshToken',
				username: 'testuser',
			});

			tokenOrchestrator.setTokenRefresher(mockTokenRefresher);
			tokenOrchestrator.setAuthTokenStore(mockAuthTokenStore);
			tokenOrchestrator.setClientMetadataProvider(clientMetadataProvider);

			mockAuthTokenStore.loadTokens.mockResolvedValue({
				accessToken: { payload: { exp: 1 } },
				idToken: { payload: { exp: 1 } },
				clockDrift: 0,
				refreshToken: 'refreshToken',
				username: 'testuser',
			});
			mockAuthTokenStore.getLastAuthUser.mockResolvedValue('testuser');

			await tokenOrchestrator.getTokens({ forceRefresh: true });

			expect(mockTokenRefresher).toHaveBeenCalledWith(
				expect.objectContaining({
					clientMetadata,
				}),
			);
		});

		it('should prioritize clientMetadata from options over clientMetadataProvider', async () => {
			const providerMetadata = { 'app-version': '1.0.0' };
			const optionsMetadata = {
				'app-version': '2.0.0',
				'device-id': 'test-device',
			};
			const clientMetadataProvider = () => Promise.resolve(providerMetadata);

			mockTokenRefresher.mockResolvedValue({
				accessToken: { payload: {} },
				idToken: { payload: {} },
				clockDrift: 0,
				refreshToken: 'newRefreshToken',
				username: 'testuser',
			});

			tokenOrchestrator.setTokenRefresher(mockTokenRefresher);
			tokenOrchestrator.setAuthTokenStore(mockAuthTokenStore);
			tokenOrchestrator.setClientMetadataProvider(clientMetadataProvider);

			mockAuthTokenStore.loadTokens.mockResolvedValue({
				accessToken: { payload: { exp: 1 } },
				idToken: { payload: { exp: 1 } },
				clockDrift: 0,
				refreshToken: 'refreshToken',
				username: 'testuser',
			});
			mockAuthTokenStore.getLastAuthUser.mockResolvedValue('testuser');

			await tokenOrchestrator.getTokens({
				forceRefresh: true,
				clientMetadata: optionsMetadata,
			});

			expect(mockTokenRefresher).toHaveBeenCalledWith(
				expect.objectContaining({
					clientMetadata: optionsMetadata,
				}),
			);
		});
	});
});

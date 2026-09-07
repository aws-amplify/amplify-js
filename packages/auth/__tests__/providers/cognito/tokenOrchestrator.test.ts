// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub, ResourcesConfig } from '@aws-amplify/core';
import { AMPLIFY_SYMBOL } from '@aws-amplify/core/internals/utils';

import { TokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import {
	addInflightPromise,
	isOAuthInProgress,
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
	// `addInflightPromise` returns an unregister handle in the real module.
	addInflightPromise: jest.fn(() => jest.fn()),
	isOAuthInProgress: jest.fn(() => false),
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
const mockIsOAuthInProgress = isOAuthInProgress as jest.Mock;

const INFLIGHT_OAUTH_KEY =
	'CognitoIdentityServiceProvider.test-id.inflightOAuth';
// Flush pending microtasks and the current (real-timer) macrotask queue.
const flushAsyncWork = () =>
	new Promise<void>(resolve => {
		setTimeout(resolve, 0);
	});

describe('TokenOrchestrator', () => {
	const tokenOrchestrator = new TokenOrchestrator();
	describe('Happy Path Cases:', () => {
		beforeAll(() => {
			mockAddInflightPromise.mockImplementation(resolver => {
				resolver();

				return jest.fn();
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

		it('Should not block indefinitely when the inflight OAuth flow is never resolved by this tab (e.g. started or abandoned in another tab), resolving after a bounded timeout', async () => {
			jest.useFakeTimers();
			try {
				mockAuthTokenStore.loadTokens.mockResolvedValue(validAuthTokens);
				(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValue(true);
				mockIsOAuthInProgress.mockReturnValue(false);
				// Simulate a tab that never processes the OAuth redirect response, so
				// the registered resolver is never invoked in-process. The listener and
				// timeout are wired before addInflightPromise is called, so resolving
				// here signals setup is complete without releasing the wait.
				const readyToAdvance = new Promise<void>(resolve => {
					mockAddInflightPromise.mockImplementationOnce(() => {
						resolve();

						return jest.fn();
					});
				});

				const tokensPromise = tokenOrchestrator.getTokens();
				await readyToAdvance;
				await jest.advanceTimersByTimeAsync(5_000);

				const tokens = await tokensPromise;
				expect(tokens?.accessToken).toEqual(validAuthTokens.accessToken);
			} finally {
				jest.useRealTimers();
			}
		});

		it('Should keep waiting past the timeout while this tab is completing its own OAuth redirect, then resolve once completion finishes', async () => {
			jest.useFakeTimers();
			try {
				mockAuthTokenStore.loadTokens.mockResolvedValue(validAuthTokens);
				(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValue(true);
				// This tab owns the flow (running completeOAuthFlow), so it must not
				// give up on the safety timeout.
				mockIsOAuthInProgress.mockReturnValue(true);
				const ready = new Promise<void>(resolve => {
					mockAddInflightPromise.mockImplementationOnce(() => {
						resolve();

						return jest.fn();
					});
				});

				let resolved = false;
				const tokensPromise = tokenOrchestrator.getTokens().then(tokens => {
					resolved = true;

					return tokens;
				});
				await ready;

				// First timeout fires but re-arms because completion is in progress.
				await jest.advanceTimersByTimeAsync(5_000);
				expect(resolved).toBe(false);

				// Completion finishes; the next timeout releases the wait.
				mockIsOAuthInProgress.mockReturnValue(false);
				await jest.advanceTimersByTimeAsync(5_000);

				const tokens = await tokensPromise;
				expect(resolved).toBe(true);
				expect(tokens?.accessToken).toEqual(validAuthTokens.accessToken);
			} finally {
				mockIsOAuthInProgress.mockReturnValue(false);
				jest.useRealTimers();
			}
		});

		it('Should stop blocking as soon as another tab clears the shared inflight OAuth flag', async () => {
			mockAuthTokenStore.loadTokens.mockResolvedValue(validAuthTokens);
			(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValue(true);
			mockIsOAuthInProgress.mockReturnValue(false);
			// Do not resolve the wait in-process; rely on the cross-tab storage event.
			const listenerReady = new Promise<void>(resolve => {
				mockAddInflightPromise.mockImplementationOnce(() => {
					resolve();

					return jest.fn();
				});
			});

			const tokensPromise = tokenOrchestrator.getTokens();
			await listenerReady;

			window.dispatchEvent(
				new StorageEvent('storage', {
					key: INFLIGHT_OAUTH_KEY,
					oldValue: 'true',
					newValue: null,
				}),
			);

			const tokens = await tokensPromise;
			expect(tokens?.accessToken).toEqual(validAuthTokens.accessToken);
		});

		it('Should ignore a storage event that sets the flag to "true" and only release when it is cleared', async () => {
			mockAuthTokenStore.loadTokens.mockResolvedValue(validAuthTokens);
			(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValue(true);
			mockIsOAuthInProgress.mockReturnValue(false);
			const ready = new Promise<void>(resolve => {
				mockAddInflightPromise.mockImplementationOnce(() => {
					resolve();

					return jest.fn();
				});
			});

			let resolved = false;
			const tokensPromise = tokenOrchestrator.getTokens().then(tokens => {
				resolved = true;

				return tokens;
			});
			await ready;

			// Another tab STARTING a flow (newValue 'true') must not release the wait.
			window.dispatchEvent(
				new StorageEvent('storage', {
					key: INFLIGHT_OAUTH_KEY,
					oldValue: null,
					newValue: 'true',
				}),
			);
			await flushAsyncWork();
			expect(resolved).toBe(false);

			// Clearing it does release the wait.
			window.dispatchEvent(
				new StorageEvent('storage', {
					key: INFLIGHT_OAUTH_KEY,
					oldValue: 'true',
					newValue: null,
				}),
			);
			await tokensPromise;
			expect(resolved).toBe(true);
		});

		it('Should ignore inflightOAuth changes for a different user pool client', async () => {
			mockAuthTokenStore.loadTokens.mockResolvedValue(validAuthTokens);
			(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValue(true);
			mockIsOAuthInProgress.mockReturnValue(false);
			const ready = new Promise<void>(resolve => {
				mockAddInflightPromise.mockImplementationOnce(() => {
					resolve();

					return jest.fn();
				});
			});

			let resolved = false;
			const tokensPromise = tokenOrchestrator.getTokens().then(tokens => {
				resolved = true;

				return tokens;
			});
			await ready;

			window.dispatchEvent(
				new StorageEvent('storage', {
					key: 'CognitoIdentityServiceProvider.another-client-id.inflightOAuth',
					oldValue: 'true',
					newValue: null,
				}),
			);
			await flushAsyncWork();
			expect(resolved).toBe(false);

			window.dispatchEvent(
				new StorageEvent('storage', {
					key: INFLIGHT_OAUTH_KEY,
					oldValue: 'true',
					newValue: null,
				}),
			);
			await tokensPromise;
			expect(resolved).toBe(true);
		});

		it('Should ignore storage events with a null key (e.g. localStorage.clear())', async () => {
			mockAuthTokenStore.loadTokens.mockResolvedValue(validAuthTokens);
			(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValue(true);
			mockIsOAuthInProgress.mockReturnValue(false);
			const ready = new Promise<void>(resolve => {
				mockAddInflightPromise.mockImplementationOnce(() => {
					resolve();

					return jest.fn();
				});
			});

			let resolved = false;
			const tokensPromise = tokenOrchestrator.getTokens().then(tokens => {
				resolved = true;

				return tokens;
			});
			await ready;

			window.dispatchEvent(
				new StorageEvent('storage', {
					key: null,
					oldValue: null,
					newValue: null,
				}),
			);
			await flushAsyncWork();
			expect(resolved).toBe(false);

			window.dispatchEvent(
				new StorageEvent('storage', {
					key: INFLIGHT_OAUTH_KEY,
					oldValue: 'true',
					newValue: null,
				}),
			);
			await tokensPromise;
			expect(resolved).toBe(true);
		});

		it('Should remove the storage listener and clear the timeout when the wait is resolved in-process', async () => {
			mockAuthTokenStore.loadTokens.mockResolvedValue(validAuthTokens);
			(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValue(true);
			mockIsOAuthInProgress.mockReturnValue(false);
			const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
			const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

			let capturedResolver: (() => void) | undefined;
			const ready = new Promise<void>(resolve => {
				mockAddInflightPromise.mockImplementationOnce(
					(resolver: () => void) => {
						capturedResolver = resolver;
						resolve();

						return jest.fn();
					},
				);
			});

			const tokensPromise = tokenOrchestrator.getTokens();
			await ready;

			// Simulate resolveAndClearInflightPromises invoking the registered resolver.
			capturedResolver?.();

			const tokens = await tokensPromise;
			expect(removeEventListenerSpy).toHaveBeenCalledWith(
				'storage',
				expect.any(Function),
			);
			expect(clearTimeoutSpy).toHaveBeenCalled();
			expect(tokens?.accessToken).toEqual(validAuthTokens.accessToken);

			removeEventListenerSpy.mockRestore();
			clearTimeoutSpy.mockRestore();
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

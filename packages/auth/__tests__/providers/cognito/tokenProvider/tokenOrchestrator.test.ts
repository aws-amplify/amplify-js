// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyError,
	AmplifyErrorCode,
} from '@aws-amplify/core/internals/utils';

import { tokenOrchestrator } from '../../../../src/providers/cognito/tokenProvider';
import { CognitoAuthTokens } from '../../../../src/providers/cognito/tokenProvider/types';
import { oAuthStore } from '../../../../src/providers/cognito/utils/oauth/oAuthStore';

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	Hub: {
		dispatch: jest.fn(),
	},
}));
jest.mock('../../../../src/providers/cognito/utils/oauth/oAuthStore');

// Helper function for creating test tokens with configurable expiration
function createTokens({
	accessTokenExpired = false,
	idTokenExpired = false,
	overrides = {},
}: {
	accessTokenExpired?: boolean;
	idTokenExpired?: boolean;
	overrides?: Partial<CognitoAuthTokens>;
} = {}): CognitoAuthTokens {
	const now = Math.floor(Date.now() / 1000);
	const pastExp = now - 3600; // 1 hour ago
	const futureExp = now + 3600; // 1 hour from now

	return {
		accessToken: {
			payload: {
				exp: accessTokenExpired ? pastExp : futureExp,
				iat: accessTokenExpired ? pastExp - 3600 : now,
			},
			toString: () =>
				accessTokenExpired ? 'mock-expired-access-token' : 'mock-access-token',
		},
		idToken: {
			payload: {
				exp: idTokenExpired ? pastExp : futureExp,
				iat: idTokenExpired ? pastExp - 3600 : now,
			},
			toString: () =>
				idTokenExpired ? 'mock-expired-id-token' : 'mock-id-token',
		},
		refreshToken: 'mock-refresh-token',
		clockDrift: 0,
		username: 'testuser',
		...overrides,
	};
}

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
		getOAuthMetadata: jest.fn(),
		setOAuthMetadata: jest.fn(),
	};

	beforeAll(() => {
		tokenOrchestrator.waitForInflightOAuth = jest.fn();
		tokenOrchestrator.setTokenRefresher(mockTokenRefresher);
		tokenOrchestrator.setAuthTokenStore(mockTokenStore);
	});

	beforeEach(() => {
		(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValue(
			Promise.resolve(false),
		);
	});

	afterEach(() => {
		(oAuthStore.loadOAuthInFlight as jest.Mock).mockClear();
	});

	describe('refreshTokens method', () => {
		it('calls the set tokenRefresher, tokenStore and Hub while refreshing tokens', async () => {
			const testUsername = 'username';
			const testSignInDetails = {
				authFlowType: 'CUSTOM_WITHOUT_SRP',
				loginId: testUsername,
			} as const;
			const testInputTokens = {
				accessToken: {
					payload: {},
				},
				clockDrift: 400000,
				username: testUsername,
				signInDetails: testSignInDetails,
			};
			// mock tokens should not include signInDetails
			const mockTokens: CognitoAuthTokens = {
				accessToken: {
					payload: {},
				},
				clockDrift: 300,
				username: testUsername,
			};
			mockTokenRefresher.mockResolvedValueOnce(mockTokens);
			mockTokenStore.storeTokens.mockResolvedValue(undefined);
			const newTokens = await (tokenOrchestrator as any).refreshTokens({
				tokens: testInputTokens,
				username: testUsername,
			});

			// ensure the underlying async operations to be completed
			// async #1
			expect(mockTokenRefresher).toHaveBeenCalledWith(
				expect.objectContaining({
					tokens: testInputTokens,
					username: testUsername,
				}),
			);
			// async #2
			expect(mockTokenStore.storeTokens).toHaveBeenCalledWith(mockTokens);

			// ensure the result is correct
			expect(newTokens).toEqual(mockTokens);
			expect(newTokens?.signInDetails).toEqual(testSignInDetails);
		});
	});

	describe('handleErrors method', () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it('does not call clearTokens() if the error is a network error thrown from fetch handler', () => {
			const clearTokensSpy = jest.spyOn(tokenOrchestrator, 'clearTokens');
			const error = new AmplifyError({
				name: AmplifyErrorCode.NetworkError,
				message: 'Network Error',
			});

			expect(() => {
				(tokenOrchestrator as any).handleErrors(error);
			}).toThrow(error);

			expect(clearTokensSpy).not.toHaveBeenCalled();
		});

		it('calls clearTokens() for NotAuthorizedException', () => {
			const clearTokensSpy = jest.spyOn(tokenOrchestrator, 'clearTokens');
			const error = new AmplifyError({
				name: 'NotAuthorizedException',
				message: 'Not authorized',
			});

			const result = (tokenOrchestrator as any).handleErrors(error);

			expect(clearTokensSpy).toHaveBeenCalled();
			expect(result).toBeNull();
		});

		it('calls clearTokens() for TokenRevokedException', () => {
			const clearTokensSpy = jest.spyOn(tokenOrchestrator, 'clearTokens');
			const error = new AmplifyError({
				name: 'TokenRevokedException',
				message: 'Token revoked',
			});

			expect(() => {
				(tokenOrchestrator as any).handleErrors(error);
			}).toThrow(error);

			expect(clearTokensSpy).toHaveBeenCalled();
		});

		it('calls clearTokens() for RefreshTokenReuseException', () => {
			const clearTokensSpy = jest.spyOn(tokenOrchestrator, 'clearTokens');
			const error = new AmplifyError({
				name: 'RefreshTokenReuseException',
				message: 'Refresh token has been invalidated by rotation',
			});

			expect(() => {
				(tokenOrchestrator as any).handleErrors(error);
			}).toThrow(error);

			expect(clearTokensSpy).toHaveBeenCalled();
		});

		it('calls clearTokens() for UserNotFoundException', () => {
			const clearTokensSpy = jest.spyOn(tokenOrchestrator, 'clearTokens');
			const error = new AmplifyError({
				name: 'UserNotFoundException',
				message: 'User not found',
			});

			expect(() => {
				(tokenOrchestrator as any).handleErrors(error);
			}).toThrow(error);

			expect(clearTokensSpy).toHaveBeenCalled();
		});

		it('does not call clearTokens() for service errors (500)', () => {
			const clearTokensSpy = jest.spyOn(tokenOrchestrator, 'clearTokens');
			const error = new AmplifyError({
				name: 'InternalServerError',
				message: 'Internal server error',
			});

			expect(() => {
				(tokenOrchestrator as any).handleErrors(error);
			}).toThrow(error);

			expect(clearTokensSpy).not.toHaveBeenCalled();
		});

		it('does not call clearTokens() for rate limit errors', () => {
			const clearTokensSpy = jest.spyOn(tokenOrchestrator, 'clearTokens');
			const error = new AmplifyError({
				name: 'TooManyRequestsException',
				message: 'Too many requests',
			});

			expect(() => {
				(tokenOrchestrator as any).handleErrors(error);
			}).toThrow(error);

			expect(clearTokensSpy).not.toHaveBeenCalled();
		});

		it('does not call clearTokens() for throttling errors', () => {
			const clearTokensSpy = jest.spyOn(tokenOrchestrator, 'clearTokens');
			const error = new AmplifyError({
				name: 'ThrottlingException',
				message: 'Request throttled',
			});

			expect(() => {
				(tokenOrchestrator as any).handleErrors(error);
			}).toThrow(error);

			expect(clearTokensSpy).not.toHaveBeenCalled();
		});

		it('does not call clearTokens() for temporary service issues', () => {
			const clearTokensSpy = jest.spyOn(tokenOrchestrator, 'clearTokens');
			const error = new AmplifyError({
				name: 'ServiceUnavailable',
				message: 'Service temporarily unavailable',
			});

			expect(() => {
				(tokenOrchestrator as any).handleErrors(error);
			}).toThrow(error);

			expect(clearTokensSpy).not.toHaveBeenCalled();
		});
	});

	describe('getTokens method', () => {
		const mockAuthConfig = {
			Cognito: {
				userPoolId: 'us-east-1_testpool',
				userPoolClientId: 'testclientid',
			},
		};

		beforeEach(() => {
			tokenOrchestrator.setAuthConfig(mockAuthConfig);
			jest.clearAllMocks();
			(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValue(false);
		});

		it('should return null when no tokens are stored', async () => {
			mockTokenStore.loadTokens.mockResolvedValue(null);

			const result = await tokenOrchestrator.getTokens();

			expect(result).toBeNull();
			expect(mockTokenRefresher).not.toHaveBeenCalled();
		});

		it('should return tokens without refresh when tokens are valid', async () => {
			const validTokens = createTokens();
			mockTokenStore.loadTokens.mockResolvedValue(validTokens);
			mockTokenStore.getLastAuthUser.mockResolvedValue('testuser');

			const result = await tokenOrchestrator.getTokens();

			expect(mockTokenRefresher).not.toHaveBeenCalled();
			expect(result?.accessToken).toBeDefined();
			expect(result?.idToken).toBeDefined();
		});

		it.each([
			[
				'access token is expired',
				{ accessTokenExpired: true, idTokenExpired: false },
			],
			[
				'ID token is expired',
				{ accessTokenExpired: false, idTokenExpired: true },
			],
			[
				'both tokens are expired',
				{ accessTokenExpired: true, idTokenExpired: true },
			],
		])('should trigger refresh when %s', async (_scenario, tokenConfig) => {
			const expiredTokens = createTokens(tokenConfig);
			const newTokens = createTokens();
			mockTokenStore.loadTokens.mockResolvedValue(expiredTokens);
			mockTokenStore.getLastAuthUser.mockResolvedValue('testuser');
			mockTokenRefresher.mockResolvedValue(newTokens);

			const result = await tokenOrchestrator.getTokens();

			expect(mockTokenRefresher).toHaveBeenCalledWith(
				expect.objectContaining({
					tokens: expiredTokens,
					username: 'testuser',
				}),
			);
			expect(result?.accessToken).toEqual(newTokens.accessToken);
		});

		it('should trigger refresh when forceRefresh is true even with valid tokens', async () => {
			const validTokens = createTokens();
			const newTokens = createTokens();
			mockTokenStore.loadTokens.mockResolvedValue(validTokens);
			mockTokenStore.getLastAuthUser.mockResolvedValue('testuser');
			mockTokenRefresher.mockResolvedValue(newTokens);

			const result = await tokenOrchestrator.getTokens({ forceRefresh: true });

			expect(mockTokenRefresher).toHaveBeenCalledWith(
				expect.objectContaining({
					tokens: validTokens,
					username: 'testuser',
				}),
			);
			expect(result?.accessToken).toEqual(newTokens.accessToken);
		});

		it('should preserve signInDetails after token refresh', async () => {
			const expiredTokens = createTokens({
				accessTokenExpired: true,
				overrides: {
					signInDetails: {
						authFlowType: 'USER_SRP_AUTH',
						loginId: 'testuser',
					},
				},
			});
			const newTokens = createTokens();

			mockTokenStore.loadTokens.mockResolvedValue(expiredTokens);
			mockTokenStore.getLastAuthUser.mockResolvedValue('testuser');
			mockTokenRefresher.mockResolvedValue(newTokens);

			const result = await tokenOrchestrator.getTokens();

			expect(result?.signInDetails?.authFlowType).toBe('USER_SRP_AUTH');
			expect(result?.signInDetails?.loginId).toBe('testuser');
		});

		it('should return null when refresh fails with NotAuthorizedException', async () => {
			const expiredTokens = createTokens({ accessTokenExpired: true });
			mockTokenStore.loadTokens.mockResolvedValue(expiredTokens);
			mockTokenStore.getLastAuthUser.mockResolvedValue('testuser');
			mockTokenRefresher.mockRejectedValue(
				new AmplifyError({
					name: 'NotAuthorizedException',
					message: 'Refresh token has expired',
				}),
			);

			const result = await tokenOrchestrator.getTokens();

			expect(result).toBeNull();
			expect(mockTokenStore.clearTokens).toHaveBeenCalled();
		});

		it('should throw error when refresh fails with network error', async () => {
			const expiredTokens = createTokens({ accessTokenExpired: true });
			mockTokenStore.loadTokens.mockResolvedValue(expiredTokens);
			mockTokenStore.getLastAuthUser.mockResolvedValue('testuser');
			mockTokenRefresher.mockRejectedValue(
				new AmplifyError({
					name: AmplifyErrorCode.NetworkError,
					message: 'Network Error',
				}),
			);

			await expect(tokenOrchestrator.getTokens()).rejects.toThrow(
				'Network Error',
			);
			expect(mockTokenStore.clearTokens).not.toHaveBeenCalled();
		});

		it('should not refresh tokens when idToken is missing but accessToken is valid', async () => {
			const tokensWithoutIdToken = createTokens();
			delete (tokensWithoutIdToken as any).idToken;
			mockTokenStore.loadTokens.mockResolvedValue(tokensWithoutIdToken);
			mockTokenStore.getLastAuthUser.mockResolvedValue('testuser');

			const result = await tokenOrchestrator.getTokens();

			expect(mockTokenRefresher).not.toHaveBeenCalled();
			expect(result?.accessToken).toBeDefined();
			expect(result?.idToken).toBeUndefined();
		});

		it('should pass clientMetadata to token refresher', async () => {
			const expiredTokens = createTokens({ accessTokenExpired: true });
			const newTokens = createTokens();
			const clientMetadata = { customKey: 'customValue' };
			mockTokenStore.loadTokens.mockResolvedValue(expiredTokens);
			mockTokenStore.getLastAuthUser.mockResolvedValue('testuser');
			mockTokenRefresher.mockResolvedValue(newTokens);

			await tokenOrchestrator.getTokens({ clientMetadata });

			expect(mockTokenRefresher).toHaveBeenCalledWith(
				expect.objectContaining({
					clientMetadata,
				}),
			);
		});

		it('should store new tokens after successful refresh', async () => {
			const expiredTokens = createTokens({ accessTokenExpired: true });
			const newTokens = createTokens();
			mockTokenStore.loadTokens.mockResolvedValue(expiredTokens);
			mockTokenStore.getLastAuthUser.mockResolvedValue('testuser');
			mockTokenRefresher.mockResolvedValue(newTokens);

			await tokenOrchestrator.getTokens();

			expect(mockTokenStore.storeTokens).toHaveBeenCalledWith(
				expect.objectContaining({
					accessToken: newTokens.accessToken,
					idToken: newTokens.idToken,
				}),
			);
		});
	});
});

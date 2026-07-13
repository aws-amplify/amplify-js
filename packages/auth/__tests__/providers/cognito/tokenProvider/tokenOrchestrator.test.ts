// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AMPLIFY_SYMBOL,
	AmplifyError,
	AmplifyErrorCode,
} from '@aws-amplify/core/internals/utils';
import { Hub } from '@aws-amplify/core';

import { tokenOrchestrator } from '../../../../src/providers/cognito/tokenProvider';
import { CognitoAuthTokens } from '../../../../src/providers/cognito/tokenProvider/types';
import { oAuthStore } from '../../../../src/providers/cognito/utils/oauth/oAuthStore';
import { dispatchSignOutBoundaryEvents } from '../../../../src/providers/cognito/utils/dispatchSignOutHubEvents';

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	Hub: {
		dispatch: jest.fn(),
	},
}));
jest.mock('../../../../src/providers/cognito/utils/oauth/oAuthStore');
jest.mock('../../../../src/providers/cognito/utils/dispatchSignOutHubEvents');

const mockDispatchSignOutBoundaryEvents =
	dispatchSignOutBoundaryEvents as jest.Mock;

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
		getAuthUserList: jest.fn(),
		addActiveSession: jest.fn(),
		removeSession: jest.fn(),
		clearTokensForUser: jest.fn(),
		getStoredIdToken: jest.fn(),
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

		it('dispatches the `tokenRefresh` Hub event carrying { username, userId }', async () => {
			const testUsername = 'username';
			const userSub = 'user-sub-123';
			// refreshed tokens whose idToken payload provides the userId (sub).
			const mockTokens: CognitoAuthTokens = {
				accessToken: {
					payload: {},
				},
				idToken: {
					payload: { sub: userSub },
				},
				clockDrift: 300,
				username: testUsername,
			};
			mockTokenRefresher.mockResolvedValueOnce(mockTokens);
			mockTokenStore.storeTokens.mockResolvedValue(undefined);
			(Hub.dispatch as jest.Mock).mockClear();

			// invoke the private refreshTokens without resorting to `as any`.
			const invokeRefreshTokens = (
				tokenOrchestrator as unknown as {
					refreshTokens(input: {
						tokens: CognitoAuthTokens;
						username: string;
					}): Promise<CognitoAuthTokens | null>;
				}
			).refreshTokens.bind(tokenOrchestrator);

			await invokeRefreshTokens({
				tokens: {
					accessToken: { payload: {} },
					clockDrift: 400000,
					username: testUsername,
				},
				username: testUsername,
			});

			expect(Hub.dispatch).toHaveBeenCalledWith(
				'auth',
				{
					event: 'tokenRefresh',
					data: { username: testUsername, userId: userSub },
				},
				'Auth',
				AMPLIFY_SYMBOL,
			);
		});
	});

	describe('handleErrors method', () => {
		const testUsername = 'user1';
		const testUserId = 'user1-sub';
		// typed invoker so we can exercise the private handleErrors without `as any`.
		const invokeHandleErrors = (
			err: unknown,
			username = testUsername,
			userId?: string,
		) =>
			(
				tokenOrchestrator as unknown as {
					handleErrors(
						err: unknown,
						username: string,
						userId?: string,
					): Promise<CognitoAuthTokens | null>;
				}
			).handleErrors(err, username, userId);

		beforeEach(() => {
			jest.clearAllMocks();
			// terminal auth errors now scope the clear to a single user + roster.
			mockTokenStore.clearTokensForUser.mockResolvedValue(undefined);
			mockTokenStore.removeSession.mockResolvedValue({
				newActiveUser: undefined,
				isEmpty: true,
			});
		});

		it('does not clear a user or emit boundary events for a network error', async () => {
			const error = new AmplifyError({
				name: AmplifyErrorCode.NetworkError,
				message: 'Network Error',
			});

			await expect(invokeHandleErrors(error)).rejects.toThrow(error);

			expect(mockTokenStore.clearTokensForUser).not.toHaveBeenCalled();
			expect(mockTokenStore.removeSession).not.toHaveBeenCalled();
			expect(mockDispatchSignOutBoundaryEvents).not.toHaveBeenCalled();
		});

		it('scopes the clear to the failing user and emits boundary events for NotAuthorizedException', async () => {
			const error = new AmplifyError({
				name: 'NotAuthorizedException',
				message: 'Not authorized',
			});

			const result = await invokeHandleErrors(error, testUsername, testUserId);

			// only the failing user's namespace + roster entry are removed; the
			// roster (AuthUserList) is NOT wiped.
			expect(mockTokenStore.clearTokensForUser).toHaveBeenCalledWith(
				testUsername,
			);
			expect(mockTokenStore.removeSession).toHaveBeenCalledWith(testUsername);
			expect(mockTokenStore.clearTokens).not.toHaveBeenCalled();
			expect(mockDispatchSignOutBoundaryEvents).toHaveBeenCalledWith(
				mockTokenStore,
				{ username: testUsername, userId: testUserId },
				{ newActiveUser: undefined, isEmpty: true },
			);
			expect(result).toBeNull();
		});

		it('preserves the tokenRefresh_failure dispatch on terminal errors', async () => {
			const error = new AmplifyError({
				name: 'NotAuthorizedException',
				message: 'Not authorized',
			});

			await invokeHandleErrors(error);

			expect(Hub.dispatch).toHaveBeenCalledWith(
				'auth',
				{ event: 'tokenRefresh_failure', data: { error } },
				'Auth',
				AMPLIFY_SYMBOL,
			);
		});

		it('scopes the clear for TokenRevokedException', async () => {
			const error = new AmplifyError({
				name: 'TokenRevokedException',
				message: 'Token revoked',
			});

			await expect(invokeHandleErrors(error)).rejects.toThrow(error);

			expect(mockTokenStore.clearTokensForUser).toHaveBeenCalledWith(
				testUsername,
			);
			expect(mockTokenStore.removeSession).toHaveBeenCalledWith(testUsername);
			expect(mockDispatchSignOutBoundaryEvents).toHaveBeenCalled();
		});

		it('scopes the clear for RefreshTokenReuseException', async () => {
			const error = new AmplifyError({
				name: 'RefreshTokenReuseException',
				message: 'Refresh token has been invalidated by rotation',
			});

			await expect(invokeHandleErrors(error)).rejects.toThrow(error);

			expect(mockTokenStore.clearTokensForUser).toHaveBeenCalledWith(
				testUsername,
			);
			expect(mockTokenStore.removeSession).toHaveBeenCalledWith(testUsername);
		});

		it('scopes the clear for UserNotFoundException', async () => {
			const error = new AmplifyError({
				name: 'UserNotFoundException',
				message: 'User not found',
			});

			await expect(invokeHandleErrors(error)).rejects.toThrow(error);

			expect(mockTokenStore.clearTokensForUser).toHaveBeenCalledWith(
				testUsername,
			);
			expect(mockTokenStore.removeSession).toHaveBeenCalledWith(testUsername);
		});

		it('emits boundary events with an undefined signedOutUser when userId is unavailable', async () => {
			const error = new AmplifyError({
				name: 'NotAuthorizedException',
				message: 'Not authorized',
			});

			await invokeHandleErrors(error, testUsername, undefined);

			expect(mockDispatchSignOutBoundaryEvents).toHaveBeenCalledWith(
				mockTokenStore,
				undefined,
				{ newActiveUser: undefined, isEmpty: true },
			);
		});

		it.each([
			['InternalServerError', 'Internal server error'],
			['TooManyRequestsException', 'Too many requests'],
			['ThrottlingException', 'Request throttled'],
			['ServiceUnavailable', 'Service temporarily unavailable'],
		])(
			'does not clear a user or emit boundary events for %s',
			async (name, message) => {
				const error = new AmplifyError({ name, message });

				await expect(invokeHandleErrors(error)).rejects.toThrow(error);

				expect(mockTokenStore.clearTokensForUser).not.toHaveBeenCalled();
				expect(mockTokenStore.removeSession).not.toHaveBeenCalled();
				expect(mockDispatchSignOutBoundaryEvents).not.toHaveBeenCalled();
			},
		);
	});
});

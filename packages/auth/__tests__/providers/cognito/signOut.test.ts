// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Amplify,
	ConsoleLogger,
	Hub,
	clearCredentials,
} from '@aws-amplify/core';

import { signOut } from '../../../src/providers/cognito/apis/signOut';
import { tokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import { DefaultOAuthStore } from '../../../src/providers/cognito/utils/signInWithRedirectStore';
import { handleOAuthSignOut } from '../../../src/providers/cognito/utils/oauth';
import { AuthTokenStore } from '../../../src/providers/cognito/tokenProvider/types';
import {
	createGlobalSignOutClient,
	createRevokeTokenClient,
} from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { getRegionFromUserPoolId } from '../../../src/foundation/parsers';
import { createCognitoUserPoolEndpointResolver } from '../../../src/providers/cognito/factories';
import { dispatchSignOutBoundaryEvents } from '../../../src/providers/cognito/utils/dispatchSignOutHubEvents';

jest.mock('@aws-amplify/core');
jest.mock('../../../src/providers/cognito/tokenProvider');
jest.mock('../../../src/providers/cognito/utils/oauth');
jest.mock('../../../src/providers/cognito/utils/signInWithRedirectStore');
jest.mock('../../../src/providers/cognito/utils/dispatchSignOutHubEvents');
jest.mock('../../../src/utils');
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/foundation/parsers');
jest.mock('../../../src/providers/cognito/factories');

describe('signOut', () => {
	// eslint-disable-next-line camelcase
	const accessToken = { payload: { origin_jti: 'revocation-id' } };
	const region = 'us-west-2';
	const cognitoConfig = {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: `${region}_zzzzz`,
		identityPoolId: `${region}:xxxxxx`,
	};
	const refreshToken = 'refresh-token';
	const cognitoAuthTokens = {
		username: 'username',
		clockDrift: 0,
		idToken: {
			payload: {},
		},
		accessToken,
		refreshToken,
	};
	// assert mocks
	const mockAmplify = Amplify as jest.Mocked<typeof Amplify>;
	const mockClearCredentials = clearCredentials as jest.Mock;
	const mockGetRegionFromUserPoolId = jest.mocked(getRegionFromUserPoolId);
	const mockGlobalSignOut = jest.fn();
	const mockCreateGlobalSignOutClient = jest.mocked(createGlobalSignOutClient);
	const mockHandleOAuthSignOut = handleOAuthSignOut as jest.Mock;
	const mockHub = Hub as jest.Mocked<typeof Hub>;
	const mockRevokeToken = jest.fn();
	const mockedRevokeTokenClient = jest.mocked(createRevokeTokenClient);
	const mockTokenOrchestrator = tokenOrchestrator as jest.Mocked<
		typeof tokenOrchestrator
	>;
	const MockDefaultOAuthStore = DefaultOAuthStore as jest.Mock;
	const mockCreateCognitoUserPoolEndpointResolver = jest.mocked(
		createCognitoUserPoolEndpointResolver,
	);
	// create mocks
	const mockLoadTokens = jest.fn();
	const mockClearTokensForUser = jest.fn();
	const mockRemoveSession = jest.fn();
	const mockClearActiveUser = jest.fn();
	const mockGetLastAuthUser = jest.fn();
	const mockGetStoredIdToken = jest.fn();
	const mockDispatchSignOutBoundaryEvents =
		dispatchSignOutBoundaryEvents as jest.Mock;
	const mockAuthTokenStore = {
		loadTokens: mockLoadTokens,
		clearTokensForUser: mockClearTokensForUser,
		removeSession: mockRemoveSession,
		clearActiveUser: mockClearActiveUser,
		getLastAuthUser: mockGetLastAuthUser,
		getStoredIdToken: mockGetStoredIdToken,
	} as unknown as AuthTokenStore;
	const mockDefaultOAuthStoreInstance = {
		setAuthConfig: jest.fn(),
	};
	// create spies
	const loggerDebugSpy = jest.spyOn(ConsoleLogger.prototype, 'debug');
	// active user resolved (from stored id token, no refresh) for sign out.
	const activeUser = { username: 'user1', userId: 'user1-id' };
	// create test helpers
	const expectSignOut = () => ({
		toComplete: () => {
			// only the active user's namespace is cleared and dropped from the roster.
			expect(mockClearTokensForUser).toHaveBeenCalledWith(activeUser.username);
			expect(mockRemoveSession).toHaveBeenCalledWith(activeUser.username);
			// the active pointer is cleared explicitly (no promotion of parked users).
			expect(mockClearActiveUser).toHaveBeenCalledTimes(1);
			expect(mockClearCredentials).toHaveBeenCalledTimes(1);
			// all boundary Hub events are delegated to the shared helper, which
			// receives ONLY the resolved signed-out user (signedOut fires ALWAYS).
			expect(mockDispatchSignOutBoundaryEvents).toHaveBeenCalledWith(
				activeUser,
			);
		},
		not: {
			toComplete: () => {
				expect(mockClearCredentials).not.toHaveBeenCalled();
				expect(mockDispatchSignOutBoundaryEvents).not.toHaveBeenCalled();
			},
		},
	});

	beforeAll(() => {
		mockGetRegionFromUserPoolId.mockReturnValue(region);
		MockDefaultOAuthStore.mockImplementation(
			() => mockDefaultOAuthStoreInstance,
		);
	});

	beforeEach(() => {
		mockAmplify.getConfig.mockReturnValue({ Auth: { Cognito: cognitoConfig } });
		mockGlobalSignOut.mockResolvedValue({ $metadata: {} });
		mockCreateGlobalSignOutClient.mockReturnValueOnce(mockGlobalSignOut);
		mockRevokeToken.mockResolvedValue({});
		mockedRevokeTokenClient.mockReturnValueOnce(mockRevokeToken);
		mockTokenOrchestrator.getTokenStore.mockReturnValue(mockAuthTokenStore);
		mockLoadTokens.mockResolvedValue(cognitoAuthTokens);
		// active user resolves from the stored id token (no refresh).
		mockGetLastAuthUser.mockResolvedValue(activeUser.username);
		mockGetStoredIdToken.mockResolvedValue({
			payload: { sub: activeUser.userId },
		});
		mockClearTokensForUser.mockResolvedValue(undefined);
		mockRemoveSession.mockResolvedValue({ isEmpty: true });
		mockClearActiveUser.mockResolvedValue(undefined);
	});

	afterEach(() => {
		mockAmplify.getConfig.mockReset();
		mockGlobalSignOut.mockReset();
		mockRevokeToken.mockReset();
		mockClearCredentials.mockClear();
		mockGetRegionFromUserPoolId.mockClear();
		mockHub.dispatch.mockClear();
		mockTokenOrchestrator.clearTokens.mockClear();
		mockClearTokensForUser.mockReset();
		mockRemoveSession.mockReset();
		mockClearActiveUser.mockReset();
		mockGetLastAuthUser.mockReset();
		mockGetStoredIdToken.mockReset();
		loggerDebugSpy.mockClear();
		mockCreateCognitoUserPoolEndpointResolver.mockClear();
		mockDispatchSignOutBoundaryEvents.mockClear();
	});

	describe('Without OAuth configured', () => {
		it('should perform client sign out on a revocable session', async () => {
			await signOut();

			expect(mockRevokeToken).toHaveBeenCalledWith(
				{ region },
				{ ClientId: cognitoConfig.userPoolClientId, Token: refreshToken },
			);
			expect(mockGetRegionFromUserPoolId).toHaveBeenCalledTimes(1);
			expect(mockGlobalSignOut).not.toHaveBeenCalled();
			expectSignOut().toComplete();
		});

		it('invokes createCognitoUserPoolEndpointResolver with the userPoolEndpoint for creating the revokeToken client', async () => {
			const expectedUserPoolEndpoint = 'https://my-custom-endpoint.com';
			const expectedEndpointResolver = jest.fn();
			mockAmplify.getConfig.mockReturnValueOnce({
				Auth: {
					Cognito: {
						...cognitoConfig,
						userPoolEndpoint: expectedUserPoolEndpoint,
					},
				},
			});
			mockCreateCognitoUserPoolEndpointResolver.mockReturnValueOnce(
				expectedEndpointResolver,
			);

			await signOut();

			expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
				endpointOverride: expectedUserPoolEndpoint,
			});
			expect(mockedRevokeTokenClient).toHaveBeenCalledWith({
				endpointResolver: expectedEndpointResolver,
			});
		});

		it('should perform client sign out on an irrevocable session', async () => {
			mockLoadTokens.mockResolvedValue({
				...cognitoAuthTokens,
				accessToken: {},
			});

			await signOut();

			expect(mockRevokeToken).not.toHaveBeenCalled();
			expect(mockGlobalSignOut).not.toHaveBeenCalled();
			expect(mockGetRegionFromUserPoolId).not.toHaveBeenCalled();
			expectSignOut().toComplete();
		});

		it('should perform global sign out', async () => {
			await signOut({ global: true });

			expect(mockGlobalSignOut).toHaveBeenCalledWith(
				{ region: 'us-west-2' },
				{ AccessToken: accessToken.toString() },
			);
			expect(mockGetRegionFromUserPoolId).toHaveBeenCalledTimes(1);
			expect(mockRevokeToken).not.toHaveBeenCalled();
			expectSignOut().toComplete();
		});

		it('invokes createCognitoUserPoolEndpointResolver with the userPoolEndpoint for creating the globalSignOut client', async () => {
			const expectedUserPoolEndpoint = 'https://my-custom-endpoint.com';
			const expectedEndpointResolver = jest.fn();
			mockAmplify.getConfig.mockReturnValueOnce({
				Auth: {
					Cognito: {
						...cognitoConfig,
						userPoolEndpoint: expectedUserPoolEndpoint,
					},
				},
			});
			mockCreateCognitoUserPoolEndpointResolver.mockReturnValueOnce(
				expectedEndpointResolver,
			);

			await signOut({ global: true });

			expect(mockCreateCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
				endpointOverride: expectedUserPoolEndpoint,
			});
			expect(mockCreateGlobalSignOutClient).toHaveBeenCalledWith({
				endpointResolver: expectedEndpointResolver,
			});
		});

		it('should still perform client sign out if token revoke fails', async () => {
			mockRevokeToken.mockRejectedValue(new Error());

			await signOut();

			expect(loggerDebugSpy).toHaveBeenCalledWith(
				expect.stringContaining('Client signOut error caught'),
			);
			expect(mockGetRegionFromUserPoolId).toHaveBeenCalledTimes(1);
			expectSignOut().toComplete();
		});

		it('should still perform global sign out if token revoke fails', async () => {
			mockGlobalSignOut.mockRejectedValue(new Error());

			await signOut({ global: true });

			expect(loggerDebugSpy).toHaveBeenCalledWith(
				expect.stringContaining('Global signOut error caught'),
			);
			expect(mockGetRegionFromUserPoolId).toHaveBeenCalledTimes(1);
			expectSignOut().toComplete();
		});
	});

	describe('multi-session boundaries (no promotion)', () => {
		it('clears the active pointer and fires signedOut while leaving parked sessions in the roster', async () => {
			// parked users remain: removeSession reports the roster is NOT empty, but
			// sign-out never promotes them — it clears the pointer and fires signedOut.
			mockRemoveSession.mockResolvedValue({ isEmpty: false });

			await signOut();

			expect(mockClearTokensForUser).toHaveBeenCalledWith(activeUser.username);
			expect(mockRemoveSession).toHaveBeenCalledWith(activeUser.username);
			expect(mockClearActiveUser).toHaveBeenCalledTimes(1);
			expect(mockClearCredentials).toHaveBeenCalledTimes(1);
			// signedOut ALWAYS; the helper receives only the signed-out user (no
			// promotion result) so it can NEVER emit switchActiveUser.
			expect(mockDispatchSignOutBoundaryEvents).toHaveBeenCalledWith(
				activeUser,
			);
		});

		it('delegates the last-user sign out to the shared boundary helper', async () => {
			mockRemoveSession.mockResolvedValue({ isEmpty: true });

			await signOut();

			expect(mockClearActiveUser).toHaveBeenCalledTimes(1);
			expect(mockClearCredentials).toHaveBeenCalledTimes(1);
			expect(mockDispatchSignOutBoundaryEvents).toHaveBeenCalledWith(
				activeUser,
			);
		});

		it('passes an undefined signedOutUser when no active user can be resolved', async () => {
			// no stored id token -> the signed-out identity is unresolvable, but the
			// pointer is still cleared and signedOut still fires (with no data).
			mockGetStoredIdToken.mockResolvedValue(undefined);
			mockRemoveSession.mockResolvedValue({ isEmpty: true });

			await signOut();

			expect(mockClearTokensForUser).toHaveBeenCalledWith(activeUser.username);
			expect(mockClearActiveUser).toHaveBeenCalledTimes(1);
			expect(mockDispatchSignOutBoundaryEvents).toHaveBeenCalledWith(undefined);
		});
	});

	describe('With OAuth configured', () => {
		const cognitoConfigWithOauth = {
			...cognitoConfig,
			loginWith: {
				oauth: {
					domain: 'hosted-ui.test',
					redirectSignIn: ['https://myapp.test/completeSignIn/'],
					redirectSignOut: ['https://myapp.test/completeSignOut/'],
					responseType: 'code' as const, // assert string union instead of string type
					scopes: [],
				},
			},
		};

		beforeEach(() => {
			mockAmplify.getConfig.mockReturnValue({
				Auth: { Cognito: cognitoConfigWithOauth },
			});
			mockHandleOAuthSignOut.mockResolvedValue({ type: 'success' });
		});

		afterEach(() => {
			mockAmplify.getConfig.mockReset();
			mockHandleOAuthSignOut.mockReset();
		});

		it('should perform OAuth sign out', async () => {
			await signOut();

			expect(MockDefaultOAuthStore).toHaveBeenCalledTimes(1);
			expect(mockDefaultOAuthStoreInstance.setAuthConfig).toHaveBeenCalledWith(
				cognitoConfigWithOauth,
			);
			expect(mockHandleOAuthSignOut).toHaveBeenCalledWith(
				cognitoConfigWithOauth,
				mockDefaultOAuthStoreInstance,
				mockTokenOrchestrator,
				undefined,
			);
			// In cases of OAuth, token removal and Hub dispatch should be performed by the OAuth handling since
			// these actions can be deferred or canceled out of altogether.
			expectSignOut().not.toComplete();
		});

		it('should throw an error on OAuth failure', async () => {
			mockHandleOAuthSignOut.mockResolvedValue({ type: 'error' });

			await expect(signOut()).rejects.toThrow();
		});
	});
});

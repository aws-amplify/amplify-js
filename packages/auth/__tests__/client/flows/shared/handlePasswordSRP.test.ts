// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createInitiateAuthClient } from '../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../../src/providers/cognito/factories';
import { getAuthenticationHelper } from '../../../../src/providers/cognito/utils/srp';
import { getUserContextData } from '../../../../src/providers/cognito/utils/userContextData';
import { handlePasswordSRP } from '../../../../src/client/flows/shared/handlePasswordSRP';
import { handlePasswordVerifierChallenge } from '../../../../src/providers/cognito/utils/handlePasswordVerifierChallenge';
import { retryOnResourceNotFoundException } from '../../../../src/providers/cognito/utils/retryOnResourceNotFoundException';
import { setActiveSignInUsername } from '../../../../src/providers/cognito/utils/setActiveSignInUsername';

// Mock dependencies
jest.mock(
	'../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../../src/providers/cognito/factories');
jest.mock('../../../../src/providers/cognito/utils/srp');
jest.mock('../../../../src/providers/cognito/utils/userContextData');
jest.mock(
	'../../../../src/providers/cognito/utils/handlePasswordVerifierChallenge',
);
jest.mock(
	'../../../../src/providers/cognito/utils/retryOnResourceNotFoundException',
);
jest.mock('../../../../src/providers/cognito/utils/setActiveSignInUsername');

describe('handlePasswordSRP', () => {
	const mockConfig = {
		userPoolId: 'us-west-2_testpool',
		userPoolClientId: 'test-client-id',
		userPoolEndpoint: 'test-endpoint',
	};

	const mockHandlePasswordVerifierChallenge = jest.mocked(
		handlePasswordVerifierChallenge,
	);
	const mockRetryOnResourceNotFoundException = jest.mocked(
		retryOnResourceNotFoundException,
	);
	const mockSetActiveSignInUsername = jest.mocked(setActiveSignInUsername);
	const mockInitiateAuth = jest.fn();
	const mockCreateEndpointResolver = jest.fn();
	const mockAuthenticationHelper = {
		A: { toString: () => '123456' },
	};
	const mockTokenOrchestrator = {
		getDeviceMetadata: jest.fn(),
		clearDeviceMetadata: jest.fn(),
	} as any;

	beforeEach(() => {
		jest.clearAllMocks();
		(createInitiateAuthClient as jest.Mock).mockReturnValue(mockInitiateAuth);
		(createCognitoUserPoolEndpointResolver as jest.Mock).mockReturnValue(
			mockCreateEndpointResolver,
		);
		(getAuthenticationHelper as jest.Mock).mockResolvedValue(
			mockAuthenticationHelper,
		);
		(getUserContextData as jest.Mock).mockReturnValue({
			UserContextData: 'test',
		});
		mockRetryOnResourceNotFoundException.mockImplementation((fn, args) =>
			fn(...args),
		);
		mockInitiateAuth.mockResolvedValue({
			ChallengeParameters: { USERNAME: 'testuser' },
			Session: 'test-session',
		});
	});

	test('should handle USER_SRP_AUTH flow without preferred challenge', async () => {
		const username = 'testuser';
		const password = 'testpassword';

		await handlePasswordSRP({
			username,
			password,
			clientMetadata: undefined,
			config: mockConfig,
			tokenOrchestrator: mockTokenOrchestrator,
			authFlow: 'USER_SRP_AUTH',
		});

		expect(mockInitiateAuth).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AuthFlow: 'USER_SRP_AUTH',
				AuthParameters: {
					USERNAME: username,
					SRP_A: '123456',
				},
				ClientId: mockConfig.userPoolClientId,
				ClientMetadata: undefined,
				UserContextData: { UserContextData: 'test' },
			},
		);
	});

	test('should handle USER_AUTH flow with preferred challenge', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const preferredChallenge = 'PASSWORD_SRP';

		await handlePasswordSRP({
			username,
			password,
			clientMetadata: undefined,
			config: mockConfig,
			tokenOrchestrator: mockTokenOrchestrator,
			authFlow: 'USER_AUTH',
			preferredChallenge,
		});

		expect(mockInitiateAuth).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				AuthFlow: 'USER_AUTH',
				AuthParameters: {
					USERNAME: username,
					SRP_A: '123456',
					PREFERRED_CHALLENGE: preferredChallenge,
				},
			}),
		);
	});

	test('should not add PREFERRED_CHALLENGE for USER_SRP_AUTH even if provided', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const preferredChallenge = 'PASSWORD_SRP';

		await handlePasswordSRP({
			username,
			password,
			clientMetadata: undefined,
			config: mockConfig,
			tokenOrchestrator: mockTokenOrchestrator,
			authFlow: 'USER_SRP_AUTH',
			preferredChallenge,
		});

		expect(mockInitiateAuth).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				AuthParameters: {
					USERNAME: username,
					SRP_A: '123456',
				},
			}),
		);
	});

	test('should handle PASSWORD_VERIFIER challenge response', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const session = 'test-session';
		const challengeParameters = {
			USERNAME: username,
			SRP_B: 'srpB',
			SALT: 'salt',
			SECRET_BLOCK: 'secret',
		};

		mockInitiateAuth.mockResolvedValueOnce({
			ChallengeName: 'PASSWORD_VERIFIER',
			ChallengeParameters: challengeParameters,
			Session: session,
		});

		await handlePasswordSRP({
			username,
			password,
			clientMetadata: undefined,
			config: mockConfig,
			tokenOrchestrator: mockTokenOrchestrator,
			authFlow: 'USER_AUTH',
		});

		expect(mockRetryOnResourceNotFoundException).toHaveBeenCalledWith(
			mockHandlePasswordVerifierChallenge,
			[
				password,
				challengeParameters,
				undefined,
				session,
				mockAuthenticationHelper,
				mockConfig,
				mockTokenOrchestrator,
			],
			username,
			mockTokenOrchestrator,
		);
	});

	test('should return response directly when not PASSWORD_VERIFIER challenge', async () => {
		const username = 'testuser';
		const mockResponse = {
			ChallengeName: 'CUSTOM_CHALLENGE',
			Session: 'test-session',
			ChallengeParameters: { USERNAME: username },
		};
		mockInitiateAuth.mockResolvedValueOnce(mockResponse);

		const result = await handlePasswordSRP({
			username,
			password: 'testpassword',
			clientMetadata: undefined,
			config: mockConfig,
			tokenOrchestrator: mockTokenOrchestrator,
			authFlow: 'USER_AUTH',
		});

		expect(result).toEqual(mockResponse);
		expect(mockRetryOnResourceNotFoundException).not.toHaveBeenCalled();
	});

	test('should handle client metadata when provided', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const clientMetadata = { client: 'test' };

		await handlePasswordSRP({
			username,
			password,
			clientMetadata,
			config: mockConfig,
			tokenOrchestrator: mockTokenOrchestrator,
			authFlow: 'USER_SRP_AUTH',
		});

		expect(mockInitiateAuth).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				ClientMetadata: clientMetadata,
			}),
		);
	});

	test('should set active username from challenge parameters', async () => {
		const username = 'testuser';
		const challengeUsername = 'challengeuser';
		const password = 'testpassword';

		mockInitiateAuth.mockResolvedValueOnce({
			ChallengeParameters: { USERNAME: challengeUsername },
			Session: 'test-session',
		});

		await handlePasswordSRP({
			username,
			password,
			clientMetadata: undefined,
			config: mockConfig,
			tokenOrchestrator: mockTokenOrchestrator,
			authFlow: 'USER_SRP_AUTH',
		});

		expect(mockSetActiveSignInUsername).toHaveBeenCalledWith(challengeUsername);
	});

	test('should call handlePasswordVerifierChallenge with correct parameters', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const session = 'test-session';
		const challengeParameters = {
			USERNAME: username,
			SRP_B: 'srpB',
			SALT: 'salt',
			SECRET_BLOCK: 'secret',
		};

		mockInitiateAuth.mockResolvedValueOnce({
			ChallengeName: 'PASSWORD_VERIFIER',
			ChallengeParameters: challengeParameters,
			Session: session,
		});

		await handlePasswordSRP({
			username,
			password,
			clientMetadata: undefined,
			config: mockConfig,
			tokenOrchestrator: mockTokenOrchestrator,
			authFlow: 'USER_SRP_AUTH',
		});

		expect(mockRetryOnResourceNotFoundException).toHaveBeenCalledWith(
			mockHandlePasswordVerifierChallenge,
			[
				password,
				challengeParameters,
				undefined,
				session,
				mockAuthenticationHelper,
				mockConfig,
				mockTokenOrchestrator,
			],
			username,
			mockTokenOrchestrator,
		);
	});

	test('should handle userPoolId without second part after underscore', async () => {
		const username = 'testuser';
		const password = 'testpassword';

		const configWithEmptyPool = {
			...mockConfig,
			userPoolId: 'us-west-2_', // Valid region format but empty after underscore
		};

		await handlePasswordSRP({
			username,
			password,
			clientMetadata: undefined,
			config: configWithEmptyPool,
			tokenOrchestrator: mockTokenOrchestrator,
			authFlow: 'USER_SRP_AUTH',
		});

		expect(getAuthenticationHelper).toHaveBeenCalledWith('');
	});

	test('should use original username when ChallengeParameters is undefined', async () => {
		const username = 'testuser';
		const password = 'testpassword';

		mockInitiateAuth.mockResolvedValueOnce({
			ChallengeName: 'PASSWORD_VERIFIER',
			Session: 'test-session',
			// ChallengeParameters is undefined
		});

		await handlePasswordSRP({
			username,
			password,
			clientMetadata: undefined,
			config: mockConfig,
			tokenOrchestrator: mockTokenOrchestrator,
			authFlow: 'USER_AUTH',
		});

		expect(mockSetActiveSignInUsername).toHaveBeenCalledWith(username);
	});

	test('should not add PREFERRED_CHALLENGE for USER_AUTH when preferredChallenge is undefined', async () => {
		const username = 'testuser';
		const password = 'testpassword';

		await handlePasswordSRP({
			username,
			password,
			clientMetadata: undefined,
			config: mockConfig,
			tokenOrchestrator: mockTokenOrchestrator,
			authFlow: 'USER_AUTH',
			// preferredChallenge is undefined
		});

		expect(mockInitiateAuth).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				AuthParameters: {
					USERNAME: username,
					SRP_A: '123456',
					// Should not include PREFERRED_CHALLENGE
				},
			}),
		);
	});

	test('should throw error when initiateAuth fails', async () => {
		const error = new Error('Auth failed');
		mockInitiateAuth.mockRejectedValueOnce(error);

		await expect(
			handlePasswordSRP({
				username: 'testuser',
				password: 'testpassword',
				clientMetadata: undefined,
				config: mockConfig,
				tokenOrchestrator: mockTokenOrchestrator,
				authFlow: 'USER_SRP_AUTH',
			}),
		).rejects.toThrow('Auth failed');
	});
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createRespondToAuthChallengeClient } from '../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { getAuthenticationHelper } from '../../../../src/providers/cognito/utils/srp';
import { getUserContextData } from '../../../../src/providers/cognito/utils/userContextData';
import { handleSelectChallengeWithPasswordSRP } from '../../../../src/client/flows/userAuth/handleSelectChallengeWithPasswordSRP';
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

describe('handleSelectChallengeWithPasswordSRP', () => {
	const mockConfig = {
		userPoolId: 'us-west-2_testpool',
		userPoolClientId: 'test-client-id',
		userPoolEndpoint: 'test-endpoint',
	};

	const mockTokenOrchestrator = {
		getDeviceMetadata: jest.fn(),
		clearDeviceMetadata: jest.fn(),
	} as any;

	const mockHandlePasswordVerifierChallenge = jest.mocked(
		handlePasswordVerifierChallenge,
	);
	const mockRetryOnResourceNotFoundException = jest.mocked(
		retryOnResourceNotFoundException,
	);
	const mockSetActiveSignInUsername = jest.mocked(setActiveSignInUsername);
	const mockRespondToAuthChallenge = jest.fn();
	const mockAuthenticationHelper = {
		A: { toString: () => '123456' },
	};

	beforeEach(() => {
		jest.clearAllMocks();
		(createRespondToAuthChallengeClient as jest.Mock).mockReturnValue(
			mockRespondToAuthChallenge,
		);
		(getAuthenticationHelper as jest.Mock).mockResolvedValue(
			mockAuthenticationHelper,
		);
		(getUserContextData as jest.Mock).mockReturnValue({
			UserContextData: 'test',
		});
		mockRespondToAuthChallenge.mockResolvedValue({
			ChallengeName: 'CUSTOM_CHALLENGE',
			Session: 'test-session',
		});
	});

	test('should handle basic SRP challenge flow', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const session = 'test-session';

		await handleSelectChallengeWithPasswordSRP(
			username,
			password,
			undefined,
			mockConfig,
			session,
			mockTokenOrchestrator,
		);

		expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				ChallengeName: 'SELECT_CHALLENGE',
				ChallengeResponses: {
					ANSWER: 'PASSWORD_SRP',
					USERNAME: username,
					SRP_A: '123456',
				},
				ClientId: mockConfig.userPoolClientId,
				ClientMetadata: undefined,
				Session: session,
				UserContextData: { UserContextData: 'test' },
			},
		);
	});

	test('should handle PASSWORD_VERIFIER challenge', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const session = 'test-session';

		const verifierResponse = {
			ChallengeName: 'PASSWORD_VERIFIER',
			Session: 'new-session',
			ChallengeParameters: {
				USERNAME: username,
				SRP_B: 'srpB',
				SALT: 'salt',
				SECRET_BLOCK: 'secret',
			},
		};

		mockRespondToAuthChallenge.mockResolvedValueOnce(verifierResponse);
		mockRetryOnResourceNotFoundException.mockImplementation((fn, args) =>
			fn(...args),
		);
		mockHandlePasswordVerifierChallenge.mockResolvedValue({
			AuthenticationResult: { AccessToken: 'token' },
			$metadata: {},
		});

		await handleSelectChallengeWithPasswordSRP(
			username,
			password,
			undefined,
			mockConfig,
			session,
			mockTokenOrchestrator,
		);

		expect(mockRetryOnResourceNotFoundException).toHaveBeenCalledWith(
			mockHandlePasswordVerifierChallenge,
			[
				password,
				verifierResponse.ChallengeParameters,
				undefined,
				verifierResponse.Session,
				mockAuthenticationHelper,
				mockConfig,
				mockTokenOrchestrator,
			],
			username,
			mockTokenOrchestrator,
		);
	});

	test('should handle client metadata when provided', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const session = 'test-session';
		const clientMetadata = { client: 'test' };

		await handleSelectChallengeWithPasswordSRP(
			username,
			password,
			clientMetadata,
			mockConfig,
			session,
			mockTokenOrchestrator,
		);

		expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				ClientMetadata: clientMetadata,
			}),
		);
	});

	test('should set active username from challenge parameters when available', async () => {
		const username = 'testuser';
		const challengeUsername = 'challengeuser';
		const password = 'testpassword';
		const session = 'test-session';

		mockRespondToAuthChallenge.mockResolvedValueOnce({
			ChallengeName: 'CUSTOM_CHALLENGE',
			Session: 'test-session',
			ChallengeParameters: {
				USERNAME: challengeUsername,
			},
		});

		await handleSelectChallengeWithPasswordSRP(
			username,
			password,
			undefined,
			mockConfig,
			session,
			mockTokenOrchestrator,
		);

		expect(mockSetActiveSignInUsername).toHaveBeenCalledWith(challengeUsername);
	});

	test('should use original username when ChallengeParameters is undefined', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const session = 'test-session';

		// Mock response without ChallengeParameters
		mockRespondToAuthChallenge.mockResolvedValueOnce({
			ChallengeName: 'CUSTOM_CHALLENGE',
			Session: 'test-session',
			ChallengeParameters: undefined,
		});

		await handleSelectChallengeWithPasswordSRP(
			username,
			password,
			undefined,
			mockConfig,
			session,
			mockTokenOrchestrator,
		);

		// Verify it falls back to the original username
		expect(mockSetActiveSignInUsername).toHaveBeenCalledWith(username);
	});

	test('should handle userPoolId without second part after underscore', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const session = 'test-session';

		// Create a new config with a userPoolId that has the region but nothing after underscore
		const invalidPoolConfig = {
			...mockConfig,
			userPoolId: 'us-west-2_', // Valid region format but empty after underscore
		};

		await handleSelectChallengeWithPasswordSRP(
			username,
			password,
			undefined,
			invalidPoolConfig,
			session,
			mockTokenOrchestrator,
		);

		// Verify getAuthenticationHelper was called with empty string
		expect(getAuthenticationHelper).toHaveBeenCalledWith('');
	});

	test('should throw error when respondToAuthChallenge fails', async () => {
		const error = new Error('Auth challenge failed');
		mockRespondToAuthChallenge.mockRejectedValueOnce(error);

		await expect(
			handleSelectChallengeWithPasswordSRP(
				'testuser',
				'testpassword',
				undefined,
				mockConfig,
				'test-session',
				mockTokenOrchestrator,
			),
		).rejects.toThrow('Auth challenge failed');
	});
});

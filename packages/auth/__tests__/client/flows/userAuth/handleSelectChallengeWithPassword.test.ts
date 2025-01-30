// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createRespondToAuthChallengeClient } from '../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../../src/providers/cognito/factories';
import { getUserContextData } from '../../../../src/providers/cognito/utils/userContextData';
import { handleSelectChallengeWithPassword } from '../../../../src/client/flows/userAuth/handleSelectChallengeWithPassword';
import { setActiveSignInUsername } from '../../../../src/providers/cognito/utils/setActiveSignInUsername';

// Mock dependencies
jest.mock(
	'../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../../src/providers/cognito/factories');
jest.mock('../../../../src/providers/cognito/utils/userContextData');
jest.mock('../../../../src/providers/cognito/utils/setActiveSignInUsername');

describe('handlePasswordChallenge', () => {
	const mockConfig = {
		userPoolId: 'us-west-2_testpool',
		userPoolClientId: 'test-client-id',
		userPoolEndpoint: 'test-endpoint',
	};

	const mockSetActiveSignInUsername = jest.mocked(setActiveSignInUsername);
	const mockRespondToAuthChallenge = jest.fn();
	const mockCreateEndpointResolver = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(createRespondToAuthChallengeClient as jest.Mock).mockReturnValue(
			mockRespondToAuthChallenge,
		);
		(createCognitoUserPoolEndpointResolver as jest.Mock).mockReturnValue(
			mockCreateEndpointResolver,
		);
		(getUserContextData as jest.Mock).mockReturnValue({
			UserContextData: 'test',
		});
		mockRespondToAuthChallenge.mockResolvedValue({
			ChallengeName: 'CUSTOM_CHALLENGE',
			Session: 'test-session',
		});
	});

	test('should handle basic password challenge flow', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const session = 'test-session';

		await handleSelectChallengeWithPassword(
			username,
			password,
			undefined,
			mockConfig,
			session,
		);

		expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				ChallengeName: 'SELECT_CHALLENGE',
				ChallengeResponses: {
					ANSWER: 'PASSWORD',
					USERNAME: username,
					PASSWORD: password,
				},
				ClientId: mockConfig.userPoolClientId,
				ClientMetadata: undefined,
				Session: session,
				UserContextData: { UserContextData: 'test' },
			},
		);
	});

	test('should handle client metadata when provided', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const session = 'test-session';
		const clientMetadata = { client: 'test' };

		await handleSelectChallengeWithPassword(
			username,
			password,
			clientMetadata,
			mockConfig,
			session,
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

		await handleSelectChallengeWithPassword(
			username,
			password,
			undefined,
			mockConfig,
			session,
		);

		expect(mockSetActiveSignInUsername).toHaveBeenCalledWith(challengeUsername);
	});

	test('should set active username as original username when challenge parameters are missing', async () => {
		const username = 'testuser';
		const password = 'testpassword';
		const session = 'test-session';

		mockRespondToAuthChallenge.mockResolvedValueOnce({
			ChallengeName: 'CUSTOM_CHALLENGE',
			Session: 'test-session',
			ChallengeParameters: {},
		});

		await handleSelectChallengeWithPassword(
			username,
			password,
			undefined,
			mockConfig,
			session,
		);

		expect(mockSetActiveSignInUsername).toHaveBeenCalledWith(username);
	});

	test('should throw error when respondToAuthChallenge fails', async () => {
		const error = new Error('Auth challenge failed');
		mockRespondToAuthChallenge.mockRejectedValueOnce(error);

		await expect(
			handleSelectChallengeWithPassword(
				'testuser',
				'testpassword',
				undefined,
				mockConfig,
				'test-session',
			),
		).rejects.toThrow('Auth challenge failed');
	});

	test('should return the response from respondToAuthChallenge', async () => {
		const mockResponse = {
			ChallengeName: 'CUSTOM_CHALLENGE',
			Session: 'new-session',
			ChallengeParameters: {
				USERNAME: 'testuser',
			},
		};
		mockRespondToAuthChallenge.mockResolvedValueOnce(mockResponse);

		const result = await handleSelectChallengeWithPassword(
			'testuser',
			'testpassword',
			undefined,
			mockConfig,
			'test-session',
		);

		expect(result).toEqual(mockResponse);
	});
});

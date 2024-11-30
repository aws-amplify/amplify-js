// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createRespondToAuthChallengeClient } from '../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../../src/providers/cognito/factories';
import { initiateSelectedChallenge } from '../../../../src/client/flows/userAuth/handleSelectChallenge';
import { RespondToAuthChallengeCommandOutput } from '../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';

// Mock dependencies
jest.mock(
	'../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../../src/providers/cognito/factories');

describe('initiateSelectedChallenge', () => {
	const mockConfig = {
		userPoolId: 'us-west-2_testpool',
		userPoolClientId: 'test-client-id',
		userPoolEndpoint: 'test-endpoint',
	};

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
		mockRespondToAuthChallenge.mockResolvedValue({
			ChallengeName: 'CUSTOM_CHALLENGE',
			Session: 'test-session',
		});
	});

	test('should handle basic challenge selection', async () => {
		const username = 'testuser';
		const session = 'test-session';
		const selectedChallenge = 'EMAIL_OTP';

		await initiateSelectedChallenge({
			username,
			session,
			selectedChallenge,
			config: mockConfig,
		});

		expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				ChallengeName: 'SELECT_CHALLENGE',
				ChallengeResponses: {
					USERNAME: username,
					ANSWER: selectedChallenge,
				},
				ClientId: mockConfig.userPoolClientId,
				Session: session,
				ClientMetadata: undefined,
			},
		);
	});

	test('should include client metadata when provided', async () => {
		const username = 'testuser';
		const session = 'test-session';
		const selectedChallenge = 'EMAIL_OTP';
		const clientMetadata = { client: 'test' };

		await initiateSelectedChallenge({
			username,
			session,
			selectedChallenge,
			config: mockConfig,
			clientMetadata,
		});

		expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				ClientMetadata: clientMetadata,
			}),
		);
	});

	test('should return the response from respondToAuthChallenge', async () => {
		const mockResponse: RespondToAuthChallengeCommandOutput = {
			ChallengeName: 'EMAIL_OTP',
			Session: 'new-session',
			ChallengeParameters: {
				CODE_DELIVERY_DELIVERY_MEDIUM: 'EMAIL',
				CODE_DELIVERY_DESTINATION: 'test@example.com',
			},
			$metadata: {},
		};
		mockRespondToAuthChallenge.mockResolvedValueOnce(mockResponse);

		const result = await initiateSelectedChallenge({
			username: 'testuser',
			session: 'test-session',
			selectedChallenge: 'EMAIL_OTP',
			config: mockConfig,
		});

		expect(result).toEqual(mockResponse);
	});

	test('should throw error when respondToAuthChallenge fails', async () => {
		const error = new Error('Auth challenge failed');
		mockRespondToAuthChallenge.mockRejectedValueOnce(error);

		await expect(
			initiateSelectedChallenge({
				username: 'testuser',
				session: 'test-session',
				selectedChallenge: 'EMAIL_OTP',
				config: mockConfig,
			}),
		).rejects.toThrow('Auth challenge failed');
	});

	test('should support different challenge types', async () => {
		const testCases = ['EMAIL_OTP', 'SMS_OTP', 'PASSWORD', 'TOTP'];

		for (const challengeType of testCases) {
			await initiateSelectedChallenge({
				username: 'testuser',
				session: 'test-session',
				selectedChallenge: challengeType,
				config: mockConfig,
			});

			expect(mockRespondToAuthChallenge).toHaveBeenLastCalledWith(
				expect.anything(),
				expect.objectContaining({
					ChallengeResponses: {
						USERNAME: 'testuser',
						ANSWER: challengeType,
					},
				}),
			);
		}
	});

	test('should use correct endpoint and region from config', async () => {
		const customConfig = {
			userPoolId: 'eu-west-1_custompool',
			userPoolClientId: 'custom-client-id',
			userPoolEndpoint: 'custom-endpoint',
		};

		await initiateSelectedChallenge({
			username: 'testuser',
			session: 'test-session',
			selectedChallenge: 'EMAIL_OTP',
			config: customConfig,
		});

		expect(createCognitoUserPoolEndpointResolver).toHaveBeenCalledWith({
			endpointOverride: customConfig.userPoolEndpoint,
		});

		expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
			expect.objectContaining({
				region: 'eu-west-1',
			}),
			expect.anything(),
		);
	});
});

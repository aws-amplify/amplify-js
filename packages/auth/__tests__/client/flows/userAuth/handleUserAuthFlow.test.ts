import { Amplify } from '@aws-amplify/core';

import { createInitiateAuthClient } from '../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../../../../src/providers/cognito/factories';
import { InitiateAuthCommandOutput } from '../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { getUserContextData } from '../../../../src/providers/cognito/utils/userContextData';
import { handleUserAuthFlow } from '../../../../src/client/flows/userAuth/handleUserAuthFlow';

// Mock dependencies
jest.mock('@aws-amplify/core/internals/utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/utils'),
	isBrowser: jest.fn(() => false),
}));
jest.mock('../../../../src/providers/cognito/utils/dispatchSignedInHubEvent');
jest.mock(
	'../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../../src/providers/cognito/factories');
jest.mock('../../../../src/providers/cognito/utils/userContextData', () => ({
	getUserContextData: jest.fn(),
}));
jest.mock('../../../../src/providers/cognito/utils/signInHelpers', () => {
	return jest.requireActual(
		'../../../../src/providers/cognito/utils/signInHelpers',
	);
});

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};

Amplify.configure({
	Auth: authConfig,
});

describe('handleUserAuthFlow', () => {
	const mockConfig = {
		userPoolId: 'us-west-2_testpool',
		userPoolClientId: 'test-client-id',
		userPoolEndpoint: 'test-endpoint',
	};

	const mockInitiateAuth = jest.fn();
	const mockCreateEndpointResolver = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(createInitiateAuthClient as jest.Mock).mockReturnValue(mockInitiateAuth);
		(createCognitoUserPoolEndpointResolver as jest.Mock).mockReturnValue(
			mockCreateEndpointResolver,
		);
		(getUserContextData as jest.Mock).mockReturnValue({
			UserContextData: 'test',
		});
		mockInitiateAuth.mockResolvedValue({
			ChallengeName: 'CUSTOM_CHALLENGE',
			Session: 'test-session',
		});
	});

	test('should handle basic auth flow without preferred challenge', async () => {
		const username = 'testuser';

		await handleUserAuthFlow({
			username,
			config: mockConfig,
			tokenOrchestrator: expect.anything(),
		});

		// Verify initiateAuth was called with correct parameters
		expect(mockInitiateAuth).toHaveBeenCalledWith(
			{
				region: 'us-west-2',
				userAgentValue: expect.any(String),
			},
			{
				AuthFlow: 'USER_AUTH',
				AuthParameters: { USERNAME: username },
				ClientId: mockConfig.userPoolClientId,
				ClientMetadata: undefined,
				UserContextData: { UserContextData: 'test' },
			},
		);
	});

	test('should handle PASSWORD preferred challenge', async () => {
		const username = 'testuser';
		const password = 'testpassword';

		await handleUserAuthFlow({
			username,
			password,
			config: mockConfig,
			tokenOrchestrator: expect.anything(),
			preferredChallenge: 'PASSWORD',
		});

		// Verify initiateAuth was called with password
		expect(mockInitiateAuth).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				AuthParameters: {
					USERNAME: username,
					PASSWORD: password,
					PREFERRED_CHALLENGE: 'PASSWORD',
				},
			}),
		);
	});

	test('should handle EMAIL_OTP preferred challenge', async () => {
		const username = 'testuser';

		await handleUserAuthFlow({
			username,
			config: mockConfig,
			tokenOrchestrator: expect.anything(),
			preferredChallenge: 'EMAIL_OTP',
		});

		// Verify initiateAuth was called with EMAIL_OTP challenge
		expect(mockInitiateAuth).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				AuthParameters: {
					USERNAME: username,
					PREFERRED_CHALLENGE: 'EMAIL_OTP',
				},
			}),
		);
	});

	test('should include client metadata when provided', async () => {
		const username = 'testuser';
		const clientMetadata = { client: 'test' };

		await handleUserAuthFlow({
			username,
			config: mockConfig,
			tokenOrchestrator: expect.anything(),
			clientMetadata,
		});

		// Verify client metadata was passed
		expect(mockInitiateAuth).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				ClientMetadata: clientMetadata,
			}),
		);
	});

	test('should handle auth response with challenges', async () => {
		const mockResponse: InitiateAuthCommandOutput = {
			ChallengeName: 'CUSTOM_CHALLENGE',
			Session: 'test-session',
			ChallengeParameters: {
				USERNAME: 'testuser',
			},
			$metadata: {},
		};
		mockInitiateAuth.mockResolvedValueOnce(mockResponse);

		const result = await handleUserAuthFlow({
			username: 'testuser',
			config: mockConfig,
			tokenOrchestrator: expect.anything(),
		});

		expect(result).toEqual(mockResponse);
	});

	test('should throw validation error for PASSWORD_SRP challenge without password', async () => {
		await expect(
			handleUserAuthFlow({
				username: 'testuser',
				config: mockConfig,
				tokenOrchestrator: expect.anything(),
				preferredChallenge: 'PASSWORD_SRP',
				// password is undefined
			}),
		).rejects.toThrow('password is required to signIn');
	});

	test('should throw validation error for PASSWORD challenge without password', async () => {
		await expect(
			handleUserAuthFlow({
				username: 'testuser',
				config: mockConfig,
				tokenOrchestrator: expect.anything(),
				preferredChallenge: 'PASSWORD',
				// password is undefined
			}),
		).rejects.toThrow('password is required to signIn');
	});

	test('should throw error when initiateAuth fails', async () => {
		const error = new Error('Auth failed');
		mockInitiateAuth.mockRejectedValueOnce(error);

		await expect(
			handleUserAuthFlow({
				username: 'testuser',
				config: mockConfig,
				tokenOrchestrator: expect.anything(),
			}),
		).rejects.toThrow('Auth failed');
	});
});

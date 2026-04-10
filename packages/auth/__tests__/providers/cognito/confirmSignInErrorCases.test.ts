import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { confirmSignIn } from '../../../src/providers/cognito/apis/confirmSignIn';
import { RespondToAuthChallengeException } from '../../../src/providers/cognito/types/errors';
import { signInStore } from '../../../src/client/utils/store';
import { AuthErrorCodes } from '../../../src/common/AuthErrorStrings';
import { createRespondToAuthChallengeClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createMockAmplifyContext } from '../../testUtils/mockAmplifyContext';

import { getMockError } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';
import { authAPITestParams } from './testUtils/authApiTestParams';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock('../../../src/client/utils/store');
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
jest.mock('../../../src/providers/cognito/factories');

const mockCtx = createMockAmplifyContext();

const { Amplify } = jest.requireMock('@aws-amplify/core');

describe('confirmSignIn API error path cases:', () => {
	const challengeName = 'SELECT_MFA_TYPE';
	const signInSession = '1234234232';
	const { username } = authAPITestParams.user1;
	// assert mocks
	const mockStoreGetState = jest.mocked(signInStore.getState);
	const mockRespondToAuthChallenge = jest.fn();
	const mockCreateRespondToAuthChallengeClient = jest.mocked(
		createRespondToAuthChallengeClient,
	);

	beforeAll(() => {
		setUpGetConfig(Amplify);
		(mockCtx as any).resourcesConfig = {
			Auth: {
				Cognito: {
					userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
				},
			},
		};
		mockStoreGetState.mockReturnValue({
			username,
			challengeName,
			signInSession,
		});
	});

	beforeEach(() => {
		mockCreateRespondToAuthChallengeClient.mockReturnValueOnce(
			mockRespondToAuthChallenge,
		);
	});

	afterEach(() => {
		mockRespondToAuthChallenge.mockReset();
		mockCreateRespondToAuthChallengeClient.mockClear();
	});

	it('confirmSignIn API should throw an error when challengeResponse is empty', async () => {
		expect.assertions(2);
		try {
			await confirmSignIn(mockCtx, { challengeResponse: '' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyChallengeResponse);
		}
	});

	it('should throw an error when sign-in step is CONTINUE_SIGN_IN_WITH_MFA_SELECTION and challengeResponse is not "SMS", "TOTP", or "EMAIL"', async () => {
		expect.assertions(2);
		try {
			await confirmSignIn(mockCtx, { challengeResponse: 'NO_SMS' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.IncorrectMFAMethod);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockRespondToAuthChallenge.mockImplementation(() => {
			throw getMockError(
				RespondToAuthChallengeException.InvalidParameterException,
			);
		});
		try {
			await confirmSignIn(mockCtx, { challengeResponse: 'TOTP' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				RespondToAuthChallengeException.InvalidParameterException,
			);
		}
	});
	it('should throw an error when sign-in step is MFA_SETUP and challengeResponse is not valid', async () => {
		expect.assertions(3);

		mockStoreGetState.mockReturnValue({
			username,
			challengeName: 'MFA_SETUP',
			signInSession,
		});

		try {
			await confirmSignIn(mockCtx, {
				challengeResponse: 'SMS',
			});
		} catch (err: any) {
			expect(err).toBeInstanceOf(AuthError);
			expect(err.name).toBe(AuthErrorCodes.SignInException);
			expect(err.message).toContain('SMS');
		}
	});
});

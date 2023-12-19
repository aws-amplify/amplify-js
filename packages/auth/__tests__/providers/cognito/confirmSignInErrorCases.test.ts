import { Amplify } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { confirmSignIn } from '../../../src/providers/cognito/apis/confirmSignIn';
import { RespondToAuthChallengeException } from '../../../src/providers/cognito/types/errors';
import { respondToAuthChallenge } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { getMockError } from './testUtils/data';
import { setUpGetConfig } from './testUtils/setUpGetConfig';
import { signInStore } from '../../../src/providers/cognito/utils/signInStore';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));
jest.mock(
	'../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);
jest.mock('../../../src/providers/cognito/utils/signInStore');

describe('confirmSignIn API error path cases:', () => {
	const challengeName = 'SELECT_MFA_TYPE';
	const signInSession = '1234234232';
	const username = authAPITestParams.user1.username;
	// assert mocks
	const mockStoreGetState = signInStore.getState as jest.Mock;
	const mockRespondToAuthChallenge = respondToAuthChallenge as jest.Mock;

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockStoreGetState.mockReturnValue({
			username,
			challengeName,
			signInSession,
		});
	});

	afterEach(() => {
		mockRespondToAuthChallenge.mockReset();
	});

	it('confirmSignIn API should throw an error when challengeResponse is empty', async () => {
		expect.assertions(2);
		try {
			await confirmSignIn({ challengeResponse: '' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyChallengeResponse);
		}
	});

	it('should throw an error when sign-in step is CONTINUE_SIGN_IN_WITH_MFA_SELECTION and challengeResponse is not "SMS" or "TOTP"', async () => {
		expect.assertions(2);
		try {
			await confirmSignIn({ challengeResponse: 'NO_SMS' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.IncorrectMFAMethod);
		}
	});

	it('should throw an error when service returns an error response', async () => {
		expect.assertions(2);
		mockRespondToAuthChallenge.mockImplementation(() => {
			throw getMockError(
				RespondToAuthChallengeException.InvalidParameterException
			);
		});
		try {
			await confirmSignIn({ challengeResponse: 'TOTP' });
		} catch (error: any) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				RespondToAuthChallengeException.InvalidParameterException
			);
		}
	});
});

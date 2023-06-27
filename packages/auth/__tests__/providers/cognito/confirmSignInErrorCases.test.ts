import { AmplifyErrorString } from '@aws-amplify/core';
import { RespondToAuthChallengeCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn } from '../../../src/providers/cognito/apis/signIn';
import * as signInHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { AuthSignInStep } from '../../../src/types';
import { confirmSignIn } from '../../../src/providers/cognito/apis/confirmSignIn';
import { RespondToAuthChallengeException } from '../../../src/providers/cognito/types/errors';

describe('confirmSignIn API error path cases:', () => {
	let handleUserSRPAuthflowSpy;
	const globalMock = global as any;
	const username = authAPITestParams.user1.username;
	const password = authAPITestParams.user1.password;
	beforeEach(async () => {
		handleUserSRPAuthflowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementationOnce(
				async (): Promise<RespondToAuthChallengeCommandOutput> => ({
					ChallengeName: 'SELECT_MFA_TYPE',
					Session: '1234234232',
					$metadata: {},
					ChallengeParameters: {
						MFAS_CAN_CHOOSE: '["SMS_MFA","SOFTWARE_TOKEN_MFA"]',
					},
				})
			);
	});

	afterEach(() => {
		handleUserSRPAuthflowSpy.mockClear();
	});

	test('confirmSignIn API should throw a validation AuthError when challengeResponse is empty', async () => {
		expect.assertions(2);
		try {
			await confirmSignIn({ challengeResponse: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyChallengeResponse);
		}
	});

	test(`confirmSignIn API should throw a validation AuthError when sign-in step is
     ${AuthSignInStep.CONTINUE_SIGN_IN_WITH_MFA_SELECTION} and challengeResponse is not "SMS" or "TOTP" `, async () => {
		expect.assertions(2);
		try {
			await signIn({ username, password });
			await confirmSignIn({ challengeResponse: 'NO_SMS' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.IncorrectMFAMethod);
		}
	});

	test('confirmSignIn API should raise service error', async () => {
		expect.assertions(3);
		const serviceError = new Error('service error');
		serviceError.name =
			RespondToAuthChallengeException.InvalidParameterException;
		globalMock.fetch = jest.fn(() => Promise.reject(serviceError));

		try {
			await signIn({ username, password });
			await confirmSignIn({
				challengeResponse: 'TOTP',
			});
		} catch (error) {
			expect(fetch).toBeCalled();
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				RespondToAuthChallengeException.InvalidParameterException
			);
		}
	});

	test(`confirmSignIn API should raise an unknown error when underlying error is 
			not coming from the service`, async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() =>
			Promise.reject(new Error('unknown error'))
		);

		try {
			await confirmSignIn({
				challengeResponse: 'TOTP',
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBeInstanceOf(Error);
		}
	});
});

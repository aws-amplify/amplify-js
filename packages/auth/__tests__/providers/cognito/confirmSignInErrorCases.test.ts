import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { authAPITestParams } from './testUtils/authApiTestParams';
import { signIn } from '../../../src/providers/cognito/apis/signIn';
import * as signInHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { confirmSignIn } from '../../../src/providers/cognito/apis/confirmSignIn';
import { RespondToAuthChallengeException } from '../../../src/providers/cognito/types/errors';
import { RespondToAuthChallengeCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';
import { Amplify } from 'aws-amplify';
import { fetchTransferHandler } from '@aws-amplify/core/internals/aws-client-utils';
import { buildMockErrorResponse, mockJsonResponse } from './testUtils/data';
jest.mock('@aws-amplify/core/dist/cjs/clients/handlers/fetch');

Amplify.configure({
	Auth: {
		Cognito: {
			userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
			userPoolId: 'us-west-2_zzzzz',
		},
	},
});
describe('confirmSignIn API error path cases:', () => {
	let handleUserSRPAuthflowSpy;
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
     ${'CONTINUE_SIGN_IN_WITH_MFA_SELECTION'} and challengeResponse is not "SMS" or "TOTP" `, async () => {
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
		expect.assertions(2);
		(fetchTransferHandler as jest.Mock).mockResolvedValue(
			mockJsonResponse(
				buildMockErrorResponse(
					RespondToAuthChallengeException.InvalidParameterException
				)
			)
		);
		try {
			await signIn({ username, password });
			await confirmSignIn({
				challengeResponse: 'TOTP',
			});
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				RespondToAuthChallengeException.InvalidParameterException
			);
		}
	});
});

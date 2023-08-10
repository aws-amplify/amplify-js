// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorString, AmplifyV6 } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { VerifySoftwareTokenException } from '../../../src/providers/cognito/types/errors';
import { verifyTOTPSetup } from '../../../src/providers/cognito';
import * as verifySoftwareTokenClient from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { VerifySoftwareTokenCommandOutput } from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider/types';

describe('verifyTOTPSetup  API happy path cases', () => {
	let verifySoftwareTokenClientSpy;
	const code = '123456';
	const friendlyDeviceName = 'FriendlyDeviceName';
	const mockedAccssToken = 'mockAccessToken';
	beforeEach(() => {
		verifySoftwareTokenClientSpy = jest
			.spyOn(verifySoftwareTokenClient, 'verifySoftwareToken')
			.mockImplementationOnce(async () => {
				return {} as VerifySoftwareTokenCommandOutput;
			});
	});

	afterEach(() => {
		verifySoftwareTokenClientSpy.mockClear();
	});

	test('verifyTOTPSetup API should return successful response', async () => {
		AmplifyV6.configure({
			Auth: {
				userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
			},
		});
		await verifyTOTPSetup({
			code,
			options: { serviceOptions: { friendlyDeviceName } },
		});

		expect(verifySoftwareTokenClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({ region: 'us-west-2' }),
			expect.objectContaining({
				AccessToken: mockedAccssToken,
				UserCode: code,
				FriendlyDeviceName: friendlyDeviceName,
			})
		);
	});
});

describe('verifyTOTPSetup  API error path cases:', () => {
	const code = '123456';

	test('verifyTOTPSetup API should throw a validation AuthError when code is empty', async () => {
		expect.assertions(2);
		try {
			AmplifyV6.configure({
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			});
			await verifyTOTPSetup({ code: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyVerifyTOTPSetupCode);
		}
	});

	test('verifyTOTPSetup API should raise an error when VerifySoftwareTokenClient throws an error', async () => {
		jest
			.spyOn(verifySoftwareTokenClient, 'verifySoftwareToken')
			.mockImplementationOnce(async () => {
				throw new AuthError({
					name: VerifySoftwareTokenException.InvalidParameterException,
					message: 'InvalidParameterException',
				});
			});
		expect.assertions(2);
		try {
			AmplifyV6.configure({
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
				},
			});
			await verifyTOTPSetup({ code });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				VerifySoftwareTokenException.InvalidParameterException
			);
		}
	});
});

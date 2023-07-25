// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorString } from '@aws-amplify/core';
import { VerifySoftwareTokenCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { VerifySoftwareTokenException } from '../../../src/providers/cognito/types/errors';
import { verifyTOTPSetup } from '../../../src/providers/cognito';
import * as verifySoftwareTokenClient from '../../../src/providers/cognito/utils/clients/VerifySoftwareTokenClient';

describe('verifyTOTPSetup  API happy path cases', () => {
	let verifySoftwareTokenClientSpy;
	const code = '123456';
	const friendlyDeviceName = 'FriendlyDeviceName';
	const mockedAccssToken = 'mockAccessToken';
	beforeEach(() => {
		verifySoftwareTokenClientSpy = jest
			.spyOn(verifySoftwareTokenClient, 'verifySoftwareTokenClient')
			.mockImplementationOnce(async () => {
				return {} as VerifySoftwareTokenCommandOutput;
			});
	});

	afterEach(() => {
		verifySoftwareTokenClientSpy.mockClear();
	});

	test('verifyTOTPSetup API should return successful response', async () => {
		await verifyTOTPSetup({
			code,
			options: { serviceOptions: { friendlyDeviceName } },
		});

		expect(verifySoftwareTokenClientSpy).toHaveBeenCalledWith(
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
	const globalMock = global as any;

	test('verifyTOTPSetup API should throw a validation AuthError when code is empty', async () => {
		expect.assertions(2);
		try {
			await verifyTOTPSetup({ code: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyVerifyTOTPSetupCode);
		}
	});

	test('verifyTOTPSetup API should raise an error when VerifySoftwareTokenClient throws an error', async () => {
		expect.assertions(3);
		const serviceError = new Error('service error');
		serviceError.name = VerifySoftwareTokenException.InvalidParameterException;
		globalMock.fetch = jest.fn(() => Promise.reject(serviceError));
		try {
			await verifyTOTPSetup({ code });
		} catch (error) {
			console.log(error);
			expect(fetch).toBeCalled();
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				VerifySoftwareTokenException.InvalidParameterException
			);
		}
	});

	test(
		'verifyTOTPSetup API should raise an unknown error when underlying error is' +
			+'not coming from the service',
		async () => {
			expect.assertions(3);
			globalMock.fetch = jest.fn(() =>
				Promise.reject(new Error('unknown error'))
			);
			try {
				await verifyTOTPSetup({ code });
			} catch (error) {
				expect(error).toBeInstanceOf(AuthError);
				expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
				expect(error.underlyingError).toBeInstanceOf(Error);
			}
		}
	);
});

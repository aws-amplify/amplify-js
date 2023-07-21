// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorString, Amplify } from '@aws-amplify/core';
import { AuthError } from '../../../src/errors/AuthError';
import { AuthValidationErrorCode } from '../../../src/errors/types/validation';
import { updatePassword } from '../../../src/providers/cognito';
import { ChangePasswordException } from '../../../src/providers/cognito/types/errors';
import * as changePasswordClient from '../../../src/providers/cognito/utils/clients/ChangePasswordClient';
import type { ChangePasswordCommandOutput } from '@aws-sdk/client-cognito-identity-provider';

describe('updatePassword API happy path cases', () => {
	const oldPassword = 'oldPassword';
	const newPassword = 'newPassword';

	let changePasswordClientSpy;

	beforeEach(() => {
		changePasswordClientSpy = jest
			.spyOn(changePasswordClient, 'changePasswordClient')
			.mockImplementationOnce(
				async (): Promise<ChangePasswordCommandOutput> => {
					return {} as ChangePasswordCommandOutput;
				}
			);
	});

	afterEach(() => {
		changePasswordClientSpy.mockClear();
	});

	test('updatePassword should call changePasswordClient', async () => {
		await updatePassword({ oldPassword, newPassword });

		expect(changePasswordClientSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				// TODO: replace this when TokenProvider is implemented
				AccessToken: 'mockedAccessToken',
				PreviousPassword: oldPassword,
				ProposedPassword: newPassword,
			})
		);
	});
});

describe('updatePassword API error path cases:', () => {
	const globalMock = global as any;
	const oldPassword = 'oldPassword';
	const newPassword = 'newPassword';

	test('updatePassword API should throw a validation AuthError when oldPassword is empty', async () => {
		expect.assertions(2);
		try {
			await updatePassword({ oldPassword: '', newPassword });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyUpdatePassword);
		}
	});

	test('updatePassword API should throw a validation AuthError when newPassword is empty', async () => {
		expect.assertions(2);
		try {
			await updatePassword({ oldPassword, newPassword: '' });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AuthValidationErrorCode.EmptyUpdatePassword);
		}
	});

	test('updatePassword API should raise service error', async () => {
		expect.assertions(3);
		const serviceError = new Error('service error');
		serviceError.name = ChangePasswordException.InvalidParameterException;
		globalMock.fetch = jest.fn(() => Promise.reject(serviceError));
		try {
			await updatePassword({ oldPassword, newPassword });
		} catch (error) {
			expect(fetch).toBeCalled();
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(
				ChangePasswordException.InvalidParameterException
			);
		}
	});

	test(
		'updatePassword API should raise an unknown error when underlying error is' +
			+'not coming from the service',
		async () => {
			expect.assertions(3);
			globalMock.fetch = jest.fn(() =>
				Promise.reject(new Error('unknown error'))
			);
			try {
				await updatePassword({ oldPassword, newPassword });
			} catch (error) {
				expect(error).toBeInstanceOf(AuthError);
				expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
				expect(error.underlyingError).toBeInstanceOf(Error);
			}
		}
	);

	test('updatePassword API should raise an unknown error when the underlying error is null', async () => {
		expect.assertions(3);
		globalMock.fetch = jest.fn(() => Promise.reject(null));
		try {
			await updatePassword({ oldPassword, newPassword });
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect(error.name).toBe(AmplifyErrorString.UNKNOWN);
			expect(error.underlyingError).toBe(null);
		}
	});
});

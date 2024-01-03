// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { signIn } from '../../../src/providers/cognito';
import { signInWithCustomAuth } from '../../../src/providers/cognito/apis/signInWithCustomAuth';
import { signInWithSRP } from '../../../src/providers/cognito/apis/signInWithSRP';
import { signInWithCustomSRPAuth } from '../../../src/providers/cognito/apis/signInWithCustomSRPAuth';
import { signInWithUserPassword } from '../../../src/providers/cognito/apis/signInWithUserPassword';
import { signIn as signInPasswordless } from '../../../src/providers/cognito/apis/passwordless';
import { AuthError } from '../../../src/errors/AuthError';

jest.mock('../../../src/providers/cognito/apis/signInWithCustomAuth');
jest.mock('../../../src/providers/cognito/apis/signInWithSRP');
jest.mock('../../../src/providers/cognito/apis/signInWithCustomSRPAuth');
jest.mock('../../../src/providers/cognito/apis/signInWithUserPassword');
jest.mock('../../../src/providers/cognito/apis/passwordless/signIn');

describe('signIn', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should call signInWithCustomAuth when authFlowType is CUSTOM_AUTH', async () => {
		const signInWithCustomAuthInput = {
			username: 'username',
			password: 'password',
			options: {
				authFlowType: 'CUSTOM_WITHOUT_SRP' as const,
			},
		};
		await signIn(signInWithCustomAuthInput);

		expect(signInWithCustomAuth).toHaveBeenCalledTimes(1);
		expect(signInWithCustomAuth).toHaveBeenCalledWith(
			signInWithCustomAuthInput
		);
	});

	it('should call signInWithSRP when authFlowType is USER_SRP_AUTH', async () => {
		const signInWithSRPInput = {
			username: 'username',
			password: 'password',
			options: {
				authFlowType: 'USER_SRP_AUTH' as const,
			},
		};
		await signIn(signInWithSRPInput);

		expect(signInWithSRP).toHaveBeenCalledTimes(1);
		expect(signInWithSRP).toHaveBeenCalledWith(signInWithSRPInput);
	});

	it('should call signInWithCustomSRPAuth when authFlowType is CUSTOM_AUTH', async () => {
		const signInWithCustomSRPAuthInput = {
			username: 'username',
			password: 'password',
			options: {
				authFlowType: 'CUSTOM_WITH_SRP' as const,
			},
		};
		await signIn(signInWithCustomSRPAuthInput);

		expect(signInWithCustomSRPAuth).toHaveBeenCalledTimes(1);
		expect(signInWithCustomSRPAuth).toHaveBeenCalledWith(
			signInWithCustomSRPAuthInput
		);
	});

	it('should call signInWithUserPassword when authFlowType is USER_PASSWORD_AUTH', async () => {
		const signInWithUserPasswordInput = {
			username: 'username',
			password: 'password',
			options: {
				authFlowType: 'USER_PASSWORD_AUTH' as const,
			},
		};
		await signIn(signInWithUserPasswordInput);

		expect(signInWithUserPassword).toHaveBeenCalledTimes(1);
		expect(signInWithUserPassword).toHaveBeenCalledWith(
			signInWithUserPasswordInput
		);
	});

	it('should call signInPasswordless when passwordless delivery medium is email and method is Magic Link', async () => {
		const signInWithEmailAndMagicLinkInput = {
			username: 'username',
			passwordless: {
				deliveryMedium: 'EMAIL' as const,
				method: 'MAGIC_LINK' as const,
			},
		};
		await signIn(signInWithEmailAndMagicLinkInput);

		expect(signInPasswordless).toHaveBeenCalledTimes(1);
		expect(signInPasswordless).toHaveBeenCalledWith(
			signInWithEmailAndMagicLinkInput
		);
	});

	it('should call signInPasswordless when passwordless delivery medium is email and method is OTP', async () => {
		const signInWithEmailAndOTPInput = {
			username: 'username',
			passwordless: {
				deliveryMedium: 'EMAIL' as const,
				method: 'OTP' as const,
			},
		};
		await signIn(signInWithEmailAndOTPInput);

		expect(signInPasswordless).toHaveBeenCalledTimes(1);
		expect(signInPasswordless).toHaveBeenCalledWith(signInWithEmailAndOTPInput);
	});

	it('should call signInPasswordless when passwordless delivery medium is SMS and method is OTP', async () => {
		const signInWithSMSAndOTPInput = {
			username: 'username',
			passwordless: {
				deliveryMedium: 'SMS' as const,
				method: 'OTP' as const,
			},
		};
		await signIn(signInWithSMSAndOTPInput);

		expect(signInPasswordless).toHaveBeenCalledTimes(1);
		expect(signInPasswordless).toHaveBeenCalledWith(signInWithSMSAndOTPInput);
	});

	it('should throw error when passwordless delivery medium is SMS and method is Magic Link', async () => {
		expect.assertions(2);
		const signInWithEmailAndOTPInput = {
			username: 'username',
			passwordless: {
				deliveryMedium: 'SMS' as const,
				method: 'MAGIC_LINK' as const,
			},
		};
		try {
			// @ts-expect-error testing invalid input
			await signIn(signInWithEmailAndOTPInput);
		} catch (error) {
			expect(error).toBeInstanceOf(AuthError);
			expect((error as AuthError).message).toEqual(
				'Incorrect passwordless method was chosen.'
			);
		}
	});
});

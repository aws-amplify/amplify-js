// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AmplifyUrl,
	assertTokenProviderConfig,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';

import { signIn } from '../../../../src/providers/cognito/apis/passwordless/signIn';
import { signUp } from '../../../../src/providers/cognito/apis/passwordless/signUp';
import { createUser } from '../../../../src/providers/cognito/apis/passwordless/createUser';
import { convertSignInOutputToSignUpOutput } from '../../../../src/providers/cognito/apis/passwordless/utils';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})), libraryOptions: {} },
}));
jest.mock('@aws-amplify/core/internals/utils');
jest.mock(
	'../../../../src/providers/cognito/utils/clients/CognitoIdentityProvider'
);
jest.mock('../../../../src/providers/cognito/apis/passwordless/utils', () => {
	const actual = jest.requireActual(
		'../../../../src/providers/cognito/apis/passwordless/utils'
	);
	return {
		...actual,
		convertSignInOutputToSignUpOutput: jest.fn(),
	};
});
jest.mock('../../../../src/providers/cognito/apis/passwordless/signIn');
jest.mock('../../../../src/providers/cognito/apis/passwordless/createUser');

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};
const mockAmplifyGetConfig = Amplify.getConfig as jest.Mock;
const mockAssertTokenProviderConfig = assertTokenProviderConfig as jest.Mock;
const mockConvertSignInOutputToSignUpOutput =
	convertSignInOutputToSignUpOutput as jest.Mock;
const mockSignInPasswordless = signIn as jest.Mock;
const mockCreateUser = createUser as jest.Mock;

describe('passwordless signUp', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockAmplifyGetConfig.mockReturnValue({
			Auth: authConfig,
		});
		Amplify.libraryOptions = {
			Auth: {
				magicLinkRedirectURL: 'redirectURI',
			},
		};
		mockAssertTokenProviderConfig.mockReturnValue(true);
		mockSignInPasswordless.mockResolvedValue('signInResult');
		mockCreateUser.mockResolvedValue('createUserResult');
	});

	it('should call create user handler', async () => {
		const input = {
			username: 'username',
			passwordless: {
				deliveryMedium: 'EMAIL' as const,
				method: 'MAGIC_LINK' as const,
			},
			options: {
				userAttributes: {
					email: 'email',
				},
			},
		};
		await signUp(input);
		expect(mockCreateUser).toHaveBeenCalledWith(
			expect.any(AmplifyUrl),
			authConfig.Cognito.userPoolId,
			input
		);
	});

	it('should call signInPasswordless with correct input', async () => {
		const input = {
			username: 'username',
			passwordless: {
				deliveryMedium: 'EMAIL' as const,
				method: 'OTP' as const,
			},
			options: {
				userAttributes: {
					email: 'email',
				},
			},
		};
		await signUp(input);
		expect(mockSignInPasswordless).toHaveBeenCalledWith(input);
	});

	it('should convert the sign-in result to sign-up result', async () => {
		const input = {
			username: 'username',
			passwordless: {
				deliveryMedium: 'SMS' as const,
				method: 'OTP' as const,
			},
			options: {
				userAttributes: {
					phone_number: 'phone_number',
				},
			},
		};
		await signUp(input);
		expect(mockConvertSignInOutputToSignUpOutput).toHaveBeenCalledWith(
			'signInResult'
		);
	});
});

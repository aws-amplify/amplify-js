// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	getAmplifyUserAgent,
} from '@aws-amplify/core/internals/utils';

import { signIn } from '../../../../src/providers/cognito/apis/passwordless/signIn';
import * as clients from '../../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { validatePasswordlessInput } from '../../../../src/providers/cognito/apis/passwordless/utils';
import {
	DUMMY_COGNITO_CHALLENGE_ANSWER,
	KEY_PASSWORDLESS_SIGN_IN_METHOD,
	KEY_PASSWORDLESS_ACTION,
	KEY_PASSWORDLESS_DELIVERY_MEDIUM,
	KEY_PASSWORDLESS_REDIRECT_URI,
} from '../../../../src/providers/cognito/apis/passwordless/constants';

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
		validatePasswordlessInput: jest.fn(),
	};
});

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};
const mockAmplifyGetConfig = Amplify.getConfig as jest.Mock;
const mockAssertTokenProviderConfig = assertTokenProviderConfig as jest.Mock;
const mockGetAmplifyUserAgent = getAmplifyUserAgent as jest.Mock;
const mockValidatePasswordlessInput = validatePasswordlessInput as jest.Mock;

describe('passwordless signIn', () => {
	let initiateAuthSpy;
	let respondToAuthChallengeSpy;
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
		mockGetAmplifyUserAgent.mockReturnValue('mock user agent');
		mockValidatePasswordlessInput.mockReturnValue(true);
		initiateAuthSpy = jest
			.spyOn(clients, 'initiateAuth')
			.mockImplementationOnce(async () => ({
				ChallengeName: 'CUSTOM_CHALLENGE',
				Session: 'session',
				$metadata: {},
			}));
		respondToAuthChallengeSpy = jest
			.spyOn(clients, 'respondToAuthChallenge')
			.mockImplementationOnce(async () => ({
				Session: 'session2',
				$metadata: {},
			}));
	});

	it('should verify config and input', async () => {
		expect.assertions(2);

		const input = {
			username: 'username',
			passwordless: {
				method: 'MAGIC_LINK' as const,
				deliveryMedium: 'EMAIL' as const,
			},
		};
		await signIn(input);
		expect(mockAssertTokenProviderConfig).toHaveBeenCalledWith(
			authConfig.Cognito
		);
		expect(mockValidatePasswordlessInput).toHaveBeenCalledWith(
			input,
			expect.anything()
		);
	});

	describe('with a Magic Link', () => {
		it('should call initiateAuth and respondToAuthChallenge APIs with the correct parameters', async () => {
			const initiateAuthSpy = jest
				.spyOn(clients, 'initiateAuth')
				.mockImplementationOnce(async () => ({
					ChallengeName: 'CUSTOM_CHALLENGE',
					Session: 'session',
					$metadata: {},
				}));
			const respondToAuthChallengeSpy = jest
				.spyOn(clients, 'respondToAuthChallenge')
				.mockImplementationOnce(async () => ({
					Session: 'session2',
					$metadata: {},
				}));

			const input = {
				username: 'username',
				passwordless: {
					method: 'MAGIC_LINK' as const,
					deliveryMedium: 'EMAIL' as const,
				},
			};
			const result = await signIn(input);

			const expectedCognitoHandlerConfig = {
				region: 'us-west-2',
				userAgentValue: 'mock user agent',
			};
			expect(initiateAuthSpy).toHaveBeenCalledTimes(1);
			expect(initiateAuthSpy).toHaveBeenCalledWith(
				expectedCognitoHandlerConfig,
				{
					AuthFlow: 'CUSTOM_AUTH',
					AuthParameters: {
						USERNAME: 'username',
					},
					ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				}
			);

			expect(respondToAuthChallengeSpy).toHaveBeenCalledTimes(1);
			expect(respondToAuthChallengeSpy).toHaveBeenCalledWith(
				expectedCognitoHandlerConfig,
				{
					ChallengeName: 'CUSTOM_CHALLENGE',
					ChallengeResponses: {
						USERNAME: 'username',
						ANSWER: DUMMY_COGNITO_CHALLENGE_ANSWER,
					},
					ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					Session: 'session',
					ClientMetadata: {
						[KEY_PASSWORDLESS_SIGN_IN_METHOD]: 'MAGIC_LINK',
						[KEY_PASSWORDLESS_ACTION]: 'REQUEST',
						[KEY_PASSWORDLESS_DELIVERY_MEDIUM]: 'EMAIL',
						[KEY_PASSWORDLESS_REDIRECT_URI]: 'redirectURI',
					},
				}
			);

			expect(result).toEqual(
				expect.objectContaining({
					isSignedIn: false,
					nextStep: expect.objectContaining({
						signInStep: 'CONFIRM_SIGN_IN_WITH_MAGIC_LINK',
					}),
				})
			);
		});
	});

	describe('with an OTP', () => {
		it('should call initiateAuth and respondToAuthChallenge APIs with the correct parameters', async () => {
			const input = {
				username: 'username',
				passwordless: {
					method: 'OTP' as const,
					deliveryMedium: 'EMAIL' as const,
				},
			};
			const result = await signIn(input);

			const expectedCognitoHandlerConfig = {
				region: 'us-west-2',
				userAgentValue: 'mock user agent',
			};
			expect(initiateAuthSpy).toHaveBeenCalledTimes(1);
			expect(initiateAuthSpy).toHaveBeenCalledWith(
				expectedCognitoHandlerConfig,
				{
					AuthFlow: 'CUSTOM_AUTH',
					AuthParameters: {
						USERNAME: 'username',
					},
					ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				}
			);

			expect(respondToAuthChallengeSpy).toHaveBeenCalledTimes(1);
			expect(respondToAuthChallengeSpy).toHaveBeenCalledWith(
				expectedCognitoHandlerConfig,
				{
					ChallengeName: 'CUSTOM_CHALLENGE',
					ChallengeResponses: {
						USERNAME: 'username',
						ANSWER: DUMMY_COGNITO_CHALLENGE_ANSWER,
					},
					ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					Session: 'session',
					ClientMetadata: {
						[KEY_PASSWORDLESS_SIGN_IN_METHOD]: 'OTP',
						[KEY_PASSWORDLESS_ACTION]: 'REQUEST',
						[KEY_PASSWORDLESS_DELIVERY_MEDIUM]: 'EMAIL',
					},
				}
			);

			expect(result).toEqual(
				expect.objectContaining({
					isSignedIn: false,
					nextStep: expect.objectContaining({
						signInStep: 'CONFIRM_SIGN_IN_WITH_OTP',
					}),
				})
			);
		});

		it('should call initiateAuth and respondToAuthChallenge APIs with the correct parameters', async () => {
			const input = {
				username: 'username',
				passwordless: {
					method: 'OTP' as const,
					deliveryMedium: 'SMS' as const,
				},
			};
			const result = await signIn(input);

			const expectedCognitoHandlerConfig = {
				region: 'us-west-2',
				userAgentValue: 'mock user agent',
			};
			expect(initiateAuthSpy).toHaveBeenCalledTimes(1);
			expect(initiateAuthSpy).toHaveBeenCalledWith(
				expectedCognitoHandlerConfig,
				{
					AuthFlow: 'CUSTOM_AUTH',
					AuthParameters: {
						USERNAME: 'username',
					},
					ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				}
			);

			expect(respondToAuthChallengeSpy).toHaveBeenCalledTimes(1);
			expect(respondToAuthChallengeSpy).toHaveBeenCalledWith(
				expectedCognitoHandlerConfig,
				{
					ChallengeName: 'CUSTOM_CHALLENGE',
					ChallengeResponses: {
						USERNAME: 'username',
						ANSWER: DUMMY_COGNITO_CHALLENGE_ANSWER,
					},
					ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					Session: 'session',
					ClientMetadata: {
						[KEY_PASSWORDLESS_SIGN_IN_METHOD]: 'OTP',
						[KEY_PASSWORDLESS_ACTION]: 'REQUEST',
						[KEY_PASSWORDLESS_DELIVERY_MEDIUM]: 'SMS',
					},
				}
			);

			expect(result).toEqual(
				expect.objectContaining({
					isSignedIn: false,
					nextStep: expect.objectContaining({
						signInStep: 'CONFIRM_SIGN_IN_WITH_OTP',
					}),
				})
			);
		});
	});
});

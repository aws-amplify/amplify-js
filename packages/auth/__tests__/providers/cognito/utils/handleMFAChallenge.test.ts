// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { createRespondToAuthChallengeClient } from '../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { setUpGetConfig } from '../testUtils/setUpGetConfig';
import { handleMFAChallenge } from '../../../../src/providers/cognito/utils/handleMFAChallenge';
import { ChallengeName } from '../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';

jest.mock('@aws-amplify/core', () => ({
	...(jest.createMockFromModule('@aws-amplify/core') as object),
	Amplify: { getConfig: jest.fn(() => ({})) },
}));

jest.mock(
	'../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);

const authConfig = {
	userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
	userPoolId: 'us-west-2_zzzzz',
};

const handleMFAChallengeTestCases: [
	Extract<ChallengeName, 'EMAIL_OTP' | 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA'>,
	'EMAIL_OTP_CODE' | 'SMS_MFA_CODE' | 'SOFTWARE_TOKEN_MFA_CODE',
][] = [
	['EMAIL_OTP', 'EMAIL_OTP_CODE'],
	['SMS_MFA', 'SMS_MFA_CODE'],
	['SOFTWARE_TOKEN_MFA', 'SOFTWARE_TOKEN_MFA_CODE'],
];

describe('handleMFAChallenge', () => {
	const mockRespondToAuthChallenge = jest.fn();
	const mockCreateRespondToAuthChallengeClient = jest.mocked(
		createRespondToAuthChallengeClient,
	);

	beforeAll(() => {
		setUpGetConfig(Amplify);
		mockCreateRespondToAuthChallengeClient.mockReturnValue(
			mockRespondToAuthChallenge,
		);
	});

	it.each(handleMFAChallengeTestCases)(
		'should construct the appropriate challenge response based on challenge name',
		async (challengeName, challengeResponseKey) => {
			const username = 'james';
			const challengeResponse = '123456';
			await handleMFAChallenge({
				challengeName,
				username,
				challengeResponse: '123456',
				config: authConfig,
			});

			expect(mockRespondToAuthChallenge).toHaveBeenCalledWith(
				expect.objectContaining({
					region: expect.any(String),
					userAgentValue: expect.any(String),
				}),
				expect.objectContaining({
					ChallengeName: challengeName,
					ChallengeResponses: expect.objectContaining({
						USERNAME: username,
						[challengeResponseKey]: challengeResponse,
					}),
					Session: undefined,
					ClientMetadata: undefined,
					ClientId: authConfig.userPoolClientId,
					UserContextData: undefined,
				}),
			);
		},
	);
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ChallengeName } from '../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { getSignInResult } from '../../../../../src/providers/cognito/utils/signInHelpers';
import { AuthSignInOutput } from '../../../../../src/types';
import { createAssociateSoftwareTokenClient } from '../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';

jest.mock(
	'../../../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
);
const basicGetSignInResultTestCases: [
	ChallengeName,
	AuthSignInOutput['nextStep']['signInStep'],
][] = [
	['CUSTOM_CHALLENGE', 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE'],
	['SELECT_CHALLENGE', 'CONTINUE_SIGN_IN_WITH_FIRST_FACTOR_SELECTION'],
	['PASSWORD', 'CONFIRM_SIGN_IN_WITH_PASSWORD'],
	['PASSWORD_SRP', 'CONFIRM_SIGN_IN_WITH_PASSWORD'],
	['SOFTWARE_TOKEN_MFA', 'CONFIRM_SIGN_IN_WITH_TOTP_CODE'],
	['SMS_MFA', 'CONFIRM_SIGN_IN_WITH_SMS_CODE'],
	['SMS_OTP', 'CONFIRM_SIGN_IN_WITH_SMS_CODE'],
	['SELECT_MFA_TYPE', 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION'],
	['NEW_PASSWORD_REQUIRED', 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'],
];

describe('getSignInResult', () => {
	const mockCreateAssociateSoftwareTokenClient = jest.mocked(
		createAssociateSoftwareTokenClient,
	);
	const mockAssociateSoftwareToken = jest.fn(() =>
		Promise.resolve({ Session: '123456', SecretCode: 'TEST', $metadata: {} }),
	);

	const mockCtx = createMockAmplifyContext({
		Auth: {
			Cognito: {
				userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				userPoolId: 'us-west-2_zzzzz',
				identityPoolId: 'us-west-2:xxxxxx',
			},
		},
	});

	beforeAll(() => {
		mockCreateAssociateSoftwareTokenClient.mockReturnValue(
			mockAssociateSoftwareToken,
		);
	});

	it.each(basicGetSignInResultTestCases)(
		'should return the correct sign in step for challenge %s',
		async (challengeName, signInStep) => {
			const { nextStep } = await getSignInResult(mockCtx, {
				challengeName,
				challengeParameters: {},
			});

			expect(nextStep.signInStep).toBe(signInStep);
		},
	);

	it('should return the correct sign in step for challenge MFA_SETUP when multiple available', async () => {
		const { nextStep } = await getSignInResult(mockCtx, {
			challengeName: 'MFA_SETUP',
			challengeParameters: {
				MFAS_CAN_SETUP: '["SOFTWARE_TOKEN_MFA", "EMAIL_OTP"]',
			},
		});
		expect(nextStep.signInStep).toBe(
			'CONTINUE_SIGN_IN_WITH_MFA_SETUP_SELECTION',
		);
	});

	it('should return the correct sign in step for challenge MFA_SETUP when only totp available', async () => {
		const { nextStep } = await getSignInResult(mockCtx, {
			challengeName: 'MFA_SETUP',
			challengeParameters: {
				MFAS_CAN_SETUP: '["SOFTWARE_TOKEN_MFA"]',
			},
		});
		expect(nextStep.signInStep).toBe('CONTINUE_SIGN_IN_WITH_TOTP_SETUP');
	});

	it('should return the correct sign in step for challenge MFA_SETUP when only email available', async () => {
		const { nextStep } = await getSignInResult(mockCtx, {
			challengeName: 'MFA_SETUP',
			challengeParameters: {
				MFAS_CAN_SETUP: '["EMAIL_OTP"]',
			},
		});
		expect(nextStep.signInStep).toBe('CONTINUE_SIGN_IN_WITH_EMAIL_SETUP');
	});
});

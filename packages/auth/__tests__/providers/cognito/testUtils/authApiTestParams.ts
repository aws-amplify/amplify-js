// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthResetPasswordStep,
	AuthSignInResult,
	AuthSignInStep,
} from '../../../../src/types';

export const authAPITestParams = {
	user1: {
		username: 'user1',
		password: 'password1',
		email: 'test1@test.com',
	},
	signUpHttpCallResult: {
		UserConfirmed: false,
		UserSub: '1234567890',
		CodeDeliveryDetails: {
			AttributeName: 'email',
			DeliveryMedium: 'EMAIL',
			Destination: 'test1@test.com',
		},
	},
	resendSignUpClientResult: {
		CodeDeliveryDetails: {
			AttributeName: 'email',
			DeliveryMedium: 'EMAIL',
			Destination: 'test@email.com',
		},
	},
	resendSignUpAPIResult: {
		destination: 'test@email.com',
		deliveryMedium: 'EMAIL',
		attributeName: 'email',
	},
	resetPasswordRequest: {
		username: 'username',
	},
	resetPasswordResult: {
		isPasswordReset: false,
		nextStep: {
			resetPasswordStep: AuthResetPasswordStep.CONFIRM_RESET_PASSWORD_WITH_CODE,
			codeDeliveryDetails: {
				destination: 'test@email.com',
				deliveryMedium: 'EMAIL',
				attributeName: 'email',
			},
		},
	},
	resetPasswordHttpCallResult: {
		CodeDeliveryDetails: {
			AttributeName: 'email',
			DeliveryMedium: 'EMAIL',
			Destination: 'test@email.com',
		},
	},
	resetPasswordRequestWithClientMetadata: {
		username: 'username',
		options: {
			serviceOptions: {
				clientMetadata: { foo: 'bar' },
			},
		},
	},
	forgotPasswordCommandWithClientMetadata: {
		Username: 'username',
		ClientMetadata: { foo: 'bar' },
	},
	configWithClientMetadata: {
		clientMetadata: { foo: 'bar' },
	},
	confirmResetPasswordHttpCallResult: {
		$metadata: {},
	},
	confirmResetPasswordRequestWithClientMetadata: {
		username: 'username',
		newPassword: 'password',
		confirmationCode: 'code',
		options: {
			serviceOptions: {
				clientMetadata: { foo: 'bar' },
			},
		},
	},
	confirmForgotPasswordCommandWithClientMetadata: {
		Username: 'username',
		Password: 'password',
		ConfirmationCode: 'code',
		ClientMetadata: { foo: 'bar' },
	},
	confirmResetPasswordRequest: {
		username: 'username',
		newPassword: 'password',
		confirmationCode: 'code',
	},
	InitiateAuthCommandOutput: {
		ChallengeName: 'PASSWORD_VERIFIER',
		ChallengeParameters: {
			USER_ID_FOR_SRP: '1111112222233333',
			SECRET_BLOCK: 'zzzzxxxxvvvv',
		},
		AuthenticationResult: undefined,
		Session: 'aaabbbcccddd',
		$metadata: {},
	},
	RespondToAuthChallengeCommandOutput: {
		ChallengeName: undefined,
		ChallengeParameters: {},
		AuthenticationResult: {
			AccessToken: 'axxcasfsfsadfqwersdf',
			ExpiresIn: 1000,
			IdToken: 'sfsfasqwerqwrsfsfsfd',
			RefreshToken: 'qwersfsafsfssfasf',
		},
		Session: 'aaabbbcccddd',
		$metadata: {},
	},
	CustomChallengeResponse: {
		ChallengeName: 'CUSTOM_CHALLENGE',
		AuthenticationResult: undefined,
		Session: 'aaabbbcccddd',
		$metadata: {},
	},
	signInResultWithCustomAuth: () => {
		return {
			isSignedIn: false,
			nextStep: {
				signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE,
			},
		};
	},
	signInResult: (): AuthSignInResult => {
		return {
			isSignedIn: true,
			nextStep: {
				signInStep: AuthSignInStep.DONE,
			},
		};
	},
};

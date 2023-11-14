// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';
import { AuthSignInResult } from '../../../../src/types';

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
			resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE',
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
			clientMetadata: { foo: 'bar' },
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
			clientMetadata: { foo: 'bar' },
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
			AccessToken:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0',
			ExpiresIn: 1000,
			IdToken:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0',
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
	CredentialsForIdentityIdResult: {
		Credentials: {
			AccessKeyId: 'AccessKeyId',
			SecretKey: 'SecretKey',
			SessionToken: 'SessionToken',
			Expiration: new Date('2023-07-29'),
		},
		$metadata: {},
	},
	NoAccessKeyCredentialsForIdentityIdResult: {
		Credentials: {
			SecretKey: 'SecretKey',
			SessionToken: 'SessionToken',
			Expiration: new Date('2023-07-29'),
		},
		$metadata: {},
	},
	NoCredentialsForIdentityIdResult: {
		$metadata: {},
	},
	NoSecretKeyInCredentialsForIdentityIdResult: {
		Credentials: {
			AccessKeyId: 'AccessKeyId',
			SessionToken: 'SessionToken',
			Expiration: new Date('2023-07-29'),
		},
		$metadata: {},
	},
	// Test values
	ValidAuthTokens: {
		idToken: decodeJWT(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIHRoZSBzZWNvbmQiLCJpYXQiOjE1MTYyMzkwMjIsImlzcyI6Imh0dHBzOi8vdGVzdC5jb20iLCJleHAiOjE3MTAyOTMxMzB9.kpvsHfKH4JvCecECmb26Pl6HaedVX7PNiiF_8AlAbYc'
		),
		accessToken: decodeJWT(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIHRoZSBzZWNvbmQiLCJpYXQiOjE1MTYyMzkwMjIsImlzcyI6Imh0dHBzOi8vdGVzdC5jb20iLCJleHAiOjE3MTAyOTMxMzB9.kpvsHfKH4JvCecECmb26Pl6HaedVX7PNiiF_8AlAbYc'
		),
		accessTokenExpAt: Date.UTC(2023, 8, 24, 18, 55),
		clockDrift: undefined,
		metadata: undefined,
	},
	ExpiredAuthTokens: {
		idToken: decodeJWT(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTAyOTMxMzB9.1o9dQV9035dCO0nKDgZ-MwFf22Ptmysymt2ENyR5Mko'
		),
		accessToken: decodeJWT(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTAyOTMxMzB9.1o9dQV9035dCO0nKDgZ-MwFf22Ptmysymt2ENyR5Mko'
		),
		accessTokenExpAt: Date.UTC(2023, 8, 24, 18, 55),
		clockDrift: undefined,
		metadata: undefined,
	},
	NewValidAuthTokens: {
		idToken: decodeJWT(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIHRoZSBzZWNvbmQiLCJpYXQiOjE1MTYyMzkwMjIsImlzcyI6Imh0dHBzOi8vdGVzdC5jb20ifQ.5eGzqDYCAYmagLpVDc1kqRT1da1wPu0_1FAg6ZNAuj8'
		),
		accessToken: decodeJWT(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIHRoZSBzZWNvbmQiLCJpYXQiOjE1MTYyMzkwMjIsImlzcyI6Imh0dHBzOi8vdGVzdC5jb20ifQ.5eGzqDYCAYmagLpVDc1kqRT1da1wPu0_1FAg6ZNAuj8'
		),
		accessTokenExpAt: Date.UTC(2023, 8, 24, 18, 55),
		clockDrift: undefined,
		metadata: undefined,
	},
	CredentialsClientRequest: {
		region: 'us-east-1',
		withValidAuthToken: {
			IdentityId: 'identity-id-test',
			Logins: {
				'test.com':
					'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIHRoZSBzZWNvbmQiLCJpYXQiOjE1MTYyMzkwMjIsImlzcyI6Imh0dHBzOi8vdGVzdC5jb20iLCJleHAiOjE3MTAyOTMxMzB9.kpvsHfKH4JvCecECmb26Pl6HaedVX7PNiiF_8AlAbYc',
			},
		},
		withNewValidAuthToken: {
			IdentityId: 'identity-id-test',
			Logins: {
				'test.com':
					'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIHRoZSBzZWNvbmQiLCJpYXQiOjE1MTYyMzkwMjIsImlzcyI6Imh0dHBzOi8vdGVzdC5jb20iLCJleHAiOjE3MTAyOTMxMzB9.kpvsHfKH4JvCecECmb26Pl6HaedVX7PNiiF_8AlAbYc',
			},
		},
	},
	GuestIdentityId: { id: 'guest-identity-id', type: 'guest' },
	PrimaryIdentityId: { id: 'primary-identity-id', type: 'primary' },

	signInResultWithCustomAuth: () => {
		return {
			isSignedIn: false,
			nextStep: {
				signInStep: 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE',
			},
		};
	},
	signInResult: (): AuthSignInResult => {
		return {
			isSignedIn: true,
			nextStep: {
				signInStep: 'DONE',
			},
		};
	},
};

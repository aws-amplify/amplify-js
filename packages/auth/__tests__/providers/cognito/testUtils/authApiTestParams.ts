// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core';
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
	// Test values
	ValidAuthTokens: {
		idToken: decodeJWT(
			'eyJraWQiOiIyd1FTbElUQ2N0bWVMdTYwY3hzRFJPOW9DXC93eDZDdVMzT2lQbHRJRldYVT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzOGEwODU1Ny1hMTFkLTQzYjEtYjc5Yi03ZTNjNDE2YWUzYzciLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMi5hbWF6b25hd3MuY29tXC91cy1lYXN0LTJfUTRpaTdlZFRJIiwiY29nbml0bzp1c2VybmFtZSI6InRlc3QyIiwib3JpZ2luX2p0aSI6ImRiM2QxOGE1LTViZTAtNDVmOS05Y2RjLTI3OWQyMmJmNzgxZCIsImF1ZCI6IjZ1bG1sYTc0Y245cDlhdmEwZmcxYnV1cjhxIiwiZXZlbnRfaWQiOiJhZjRjMmM5NC04ZTY0LTRkYWYtYjc5ZS02NTE0NTEyMjE3OTAiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY5MDkzMjM0MCwiZXhwIjoxNjkwOTM1OTQwLCJpYXQiOjE2OTA5MzIzNDAsImp0aSI6ImVhM2JmNmNlLWEyZWUtNGJiMC05MjdkLWNjMzRjYzRhMWVjMiIsImVtYWlsIjoiYW16bm1hbm9qQGdtYWlsLmNvbSJ9.i71wkSBPZt8BlBFMZPILJ6RsfDaJx0xqriD9y6ly3LnNB2vNAIOZqPLcCKEi8u0obyoFIK_EY7jKVRva5wbDDcHGt5YrnjT3SsWc1FGVUhrPW6IzEwbfYkUsbVGYjfO1hqTMW7q3FHvJ4yFjLDIUHQe-1_NogYeuhjrNxEupOPmE5-52N4dRriZ0DlHD4fe7gqL8B6AJXr5np1XaxZySU4KpdePwIp1Nb2fkolMEGHvOANHqWdBe5I0vRhAh0MDJ6IxvEr65tnaJNgVQuQaZFR4kQlpjemvB7kaVQ-SpH-tV_zXzqpwr_OEH6dgGMcxIsFrBFC8AGQnGXlSsS-5ThQ'
		),
		accessToken: decodeJWT(
			'eyJraWQiOiJsUjZHYWlsakJyNVl6Z2tSakxoenNLR2IwUkFqd2FmbVg3RTlJOFRRdUE0PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzOGEwODU1Ny1hMTFkLTQzYjEtYjc5Yi03ZTNjNDE2YWUzYzciLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0yLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMl9RNGlpN2VkVEkiLCJjbGllbnRfaWQiOiI2dWxtbGE3NGNuOXA5YXZhMGZnMWJ1dXI4cSIsIm9yaWdpbl9qdGkiOiJkYjNkMThhNS01YmUwLTQ1ZjktOWNkYy0yNzlkMjJiZjc4MWQiLCJldmVudF9pZCI6ImFmNGMyYzk0LThlNjQtNGRhZi1iNzllLTY1MTQ1MTIyMTc5MCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE2OTA5MzIzNDAsImV4cCI6MTY5MDkzNTk0MCwiaWF0IjoxNjkwOTMyMzQwLCJqdGkiOiIzMjY2NWI4Zi04ZWFlLTQ5NzgtYjA1Ny00ODc1ZmFhNDBhMzUiLCJ1c2VybmFtZSI6InRlc3QyIn0.EHXtiMNrZQ0WzxWM8N15wXGVxLyxXkUaOzEf7Nj4yETpFsOQH1thufbxfu0e2Td0flDjiVTwTyeRD0Hue3_F4tC2o9_6kFlO9TBnQJnMI4mrSsbaTSTSgHJ8HS9YP7nDbcZ1QXFdWHlzPEoRSoJ9y_0oji8Bl3ZsyXIVCzSUfil_t0ZKhtprQnUakPDeqCunBT1oh-pqUsYC1g6lwS7vfucivJpuyxfnpcOEfQYY6VMlZxpDurEniOy7vgy6e8ElYpIdUzpBaRB_CvhDj6tYlnLRVTBOnKcRdckZMd69SJ8zTKtmxAsYbxF6DWZQTK6e82Rft1Uc5rLxKAD6VK92xA'
		),
		accessTokenExpAt: Date.UTC(2023, 8, 24, 18, 55),

		clockDrift: undefined,
		metadata: undefined,
	},
	GuestIdentityId: { id: 'guest-identity-id', type: 'guest' },
	PrimaryIdentityId: { id: 'primary-identity-id', type: 'primary' },

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

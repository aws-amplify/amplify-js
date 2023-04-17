// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthResetPasswordStep } from "../../../../src/types";

export const authAPITestParams = {
	user1: {
		username: 'user1',
		password: 'password1',
		email: 'test1@test.com',
	},
	resetPasswordResult: {
		isPasswordReset: false,
			nextStep: {
				resetPasswordStep: AuthResetPasswordStep.CONFIRM_RESET_PASSWORD_WITH_CODE,
				codeDeliveryDetails: {
					destination: 'test@email.com',
					deliveryMedium: 'EMAIL',
					attributeName: 'email'
				}
			}
	},
	resetPasswordRequestWithClientMetadata: {
		username: 'username',
		options: {
			serviceOptions: {
				clientMetadata: { foo: 'bar' }
			}
		}
	},
	forgotPasswordCommandWithClientMetadata: {
		Username: 'username',
		ClientMetadata: {foo: 'bar'}
	},
	configWithClientMetadata: {
		clientMetadata: {foo: 'bar'}
	},
	confirmResetPasswordRequestWithClientMetadata: {
		username: 'username',
		newPassword: 'password',
		confirmationCode: 'code',
		options: {
			serviceOptions: {
				clientMetadata: { foo: 'bar' }
			}
		}
	},
	confirmForgotPasswordCommandWithClientMetadata: {
		Username: 'username',
		Password: 'password',
		ConfirmationCode: 'code',
		ClientMetadata: {foo: 'bar'}
	},
	confirmResetPasswordRequest: {
		username: 'username',
		newPassword: 'password',
		confirmationCode: 'code'
	},
};

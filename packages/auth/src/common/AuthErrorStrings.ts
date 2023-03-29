// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorMap } from '@aws-amplify/core/src/types/types';
import { AuthValidationErrorCode } from '../errors/types/validation';

export const validationErrorMap: AmplifyErrorMap<AuthValidationErrorCode> = {
	[AuthValidationErrorCode.EmptyChallengeResponse]: {
		message: 'challengeResponse is required to confirmSignIn',
	},
	[AuthValidationErrorCode.EmptyConfirmResetPasswordUsername]: {
		message: 'username is required to confirmResetPassword',
	},
	[AuthValidationErrorCode.EmptyConfirmSignUpCode]: {
		message: 'code is required to confirmSignUp',
	},
	[AuthValidationErrorCode.EmptyConfirmSignUpUsername]: {
		message: 'username is required to confirmSignUp',
	},
	[AuthValidationErrorCode.EmptyConfirmResetPasswordConfirmationCode]: {
		message: 'confirmationCode is required to confirmResetPassword',
	},
	[AuthValidationErrorCode.EmptyConfirmResetPasswordNewPassword]: {
		message: 'newPassword is required to confirmResetPassword',
	},
	[AuthValidationErrorCode.EmptyResendSignUpCodeUsername]: {
		message: 'username is required to confirmSignUp',
	},
	[AuthValidationErrorCode.EmptyResetPasswordUsername]: {
		message: 'username is required to resetPassword',
	},
	[AuthValidationErrorCode.EmptySignInPassword]: {
		message: 'password is required to signIn',
	},
	[AuthValidationErrorCode.EmptySignInUsername]: {
		message: 'username is required to signIn',
	},
	[AuthValidationErrorCode.EmptySignUpPassword]: {
		message: 'password is required to signUp',
	},
	[AuthValidationErrorCode.EmptySignUpUsername]: {
		message: 'username is required to signUp',
	},
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export enum AuthValidationErrorCode {
	EmptySignInUsername = 'EmptySignInUsername',
	EmptySignInPassword = 'EmptySignInPassword',
	CustomAuthSignInPassword = 'CustomAuthSignInPassword',
	EmptySignUpUsername = 'EmptySignUpUsername',
	EmptySignUpPassword = 'EmptySignUpPassword',
	EmptyConfirmSignUpUsername = 'EmptyConfirmSignUpUsername',
	EmptyConfirmSignUpCode = 'EmptyConfirmSignUpCode',
	EmptyResendSignUpCodeUsername = 'EmptyresendSignUpCodeUsername',
	EmptyChallengeResponse = 'EmptyChallengeResponse',
	EmptyConfirmResetPasswordUsername = 'EmptyConfirmResetPasswordUsername',
	EmptyConfirmResetPasswordNewPassword = 'EmptyConfirmResetPasswordNewPassword',
	EmptyConfirmResetPasswordConfirmationCode = 'EmptyConfirmResetPasswordConfirmationCode',
	EmptyResetPasswordUsername = 'EmptyResetPasswordUsername',
	EmptyVerifyTOTPSetupCode = 'EmptyVerifyTOTPSetupCode',
	EmptyConfirmUserAttributeCode = 'EmptyConfirmUserAttributeCode',
	IncorrectMFAMethod = 'IncorrectMFAMethod',
	EmptyUpdatePassword = 'EmptyUpdatePassword',
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export enum AuthValidationErrorCode {
	EmptySignInUsername = 'EmptySignInUsername',
	EmptySignInPassword = 'EmptySignInPassword',
	PasswordlessSignInHasPassword = 'PasswordlessSignInHasPassword',
	IncorrectPasswordlessMethod = 'IncorrectPasswordlessMethod',
	CustomAuthSignInPassword = 'CustomAuthSignInPassword',
	EmptySignUpUsername = 'EmptySignUpUsername',
	EmptySignUpPassword = 'EmptySignUpPassword',
	PasswordlessSignUpHasPassword = 'PasswordlessSignUpHasPassword',
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

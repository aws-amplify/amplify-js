// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Default provider APIs, types & enums
export {
	signUp,
	resetPassword,
	confirmResetPassword,
	signIn,
	resendSignUpCode,
	confirmSignUp,
	confirmSignIn,
	updateMFAPreference,
	fetchMFAPreference,
	verifyTOTPSetup,
	updatePassword,
	setUpTOTP,
	updateUserAttributes,
	updateUserAttribute,
	getCurrentUser,
	confirmUserAttribute,
	signInWithRedirect,
	fetchUserAttributes,
	signOut,
	sendUserAttributeVerificationCode,
	deleteUserAttributes,
	deleteUser,
	rememberDevice,
	forgetDevice,
} from './providers/cognito';

export {
	ConfirmResetPasswordInput,
	ConfirmSignInInput,
	ConfirmSignUpInput,
	ConfirmUserAttributeInput,
	ResendSignUpCodeInput,
	ResetPasswordInput,
	SignInInput,
	SignInWithRedirectInput,
	SignOutInput,
	SignUpInput,
	UpdateMFAPreferenceInput,
	UpdatePasswordInput,
	UpdateUserAttributesInput,
	UpdateUserAttributeInput,
	VerifyTOTPSetupInput,
	SendUserAttributeVerificationCodeInput,
	DeleteUserAttributesInput,
} from './providers/cognito';

export {
	FetchUserAttributesOutput,
	GetCurrentUserOutput,
	ConfirmSignInOutput,
	ConfirmSignUpOutput,
	FetchMFAPreferenceOutput,
	ResendSignUpCodeOutput,
	ResetPasswordOutput,
	SetUpTOTPOutput,
	SignInOutput,
	SignOutOutput,
	SignUpOutput,
	UpdateUserAttributesOutput,
	SendUserAttributeVerificationCodeOutput,
	UpdateUserAttributeOutput,
} from './providers/cognito';

export { AuthError } from './errors/AuthError';

export { fetchAuthSession } from '@aws-amplify/core';

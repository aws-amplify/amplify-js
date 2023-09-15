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
	getCurrentUser,
	confirmUserAttribute,
	signInWithRedirect,
	fetchUserAttributes,
	signOut,
} from './providers/cognito';

export {
	GetCurrentUserInput,
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
	VerifyTOTPSetupInput,
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
} from './providers/cognito';

export { AuthError } from './errors/AuthError';

export { fetchAuthSession } from '@aws-amplify/core';

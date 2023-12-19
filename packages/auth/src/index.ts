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
	fetchDevices,
	autoSignIn,
	AuthUser,
	CodeDeliveryDetails,
	UserAttributeKey,
	VerifiableUserAttributeKey,
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
	ForgetDeviceInput,
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
	SignUpOutput,
	UpdateUserAttributesOutput,
	SendUserAttributeVerificationCodeOutput,
	UpdateUserAttributeOutput,
	FetchDevicesOutput,
} from './providers/cognito';

export { AuthError } from './errors/AuthError';

export {
	fetchAuthSession,
	decodeJWT,
	CredentialsAndIdentityIdProvider,
	GetCredentialsOptions,
	CredentialsAndIdentityId,
	TokenProvider,
	AuthTokens,
	JWT,
} from '@aws-amplify/core';

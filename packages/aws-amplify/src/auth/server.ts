// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @deprecated Server-specific imports are no longer needed.
 * Use {@link aws-amplify/auth | aws-amplify/auth} directly — all APIs now accept
 * an optional `AmplifyContext` as the first argument.
 *
 * @example
 * ```ts
 * // Before:
 * import { fetchUserAttributes } from "aws-amplify/auth/server";
 * fetchUserAttributes(contextSpec);
 *
 * // After:
 * import { fetchUserAttributes } from "aws-amplify/auth";
 * fetchUserAttributes(ctx, { /* options *​/ });
 * ```
 */

export {
	signUp,
	signIn,
	signOut,
	confirmSignUp,
	confirmSignIn,
	resetPassword,
	confirmResetPassword,
	resendSignUpCode,
	updateMFAPreference,
	fetchMFAPreference,
	verifyTOTPSetup,
	setUpTOTP,
	updatePassword,
	updateUserAttributes,
	updateUserAttribute,
	getCurrentUser,
	confirmUserAttribute,
	signInWithRedirect,
	fetchUserAttributes,
	sendUserAttributeVerificationCode,
	deleteUserAttributes,
	deleteUser,
	rememberDevice,
	forgetDevice,
	fetchDevices,
	autoSignIn,
	AuthError,
	decodeJWT,
	associateWebAuthnCredential,
	listWebAuthnCredentials,
	deleteWebAuthnCredential,
} from '@aws-amplify/auth';

export type {
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
	FetchAuthSessionOptions,
	AuthSession,
	CredentialsAndIdentityIdProvider,
	GetCredentialsOptions,
	CredentialsAndIdentityId,
	TokenProvider,
	AuthTokens,
	JWT,
	AuthUser,
	CodeDeliveryDetails,
	UserAttributeKey,
	VerifiableUserAttributeKey,
	AuthWebAuthnCredential,
	DeleteWebAuthnCredentialInput,
	ListWebAuthnCredentialsInput,
	ListWebAuthnCredentialsOutput,
} from '@aws-amplify/auth';

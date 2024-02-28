// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthVerifiableAttributeKey } from '@aws-amplify/core/internals/utils';

import {
	ConfirmResetPasswordOptions,
	ConfirmSignInOptions,
	ConfirmSignUpOptions,
	MFAPreference,
	ResendSignUpCodeOptions,
	ResetPasswordOptions,
	SendUserAttributeVerificationCodeOptions,
	SignInOptions,
	SignUpOptions,
	UpdateUserAttributeOptions,
	UpdateUserAttributesOptions,
	UserAttributeKey,
	VerifiableUserAttributeKey,
	VerifyTOTPSetupOptions,
} from '../types';
import {
	AuthConfirmResetPasswordInput,
	AuthConfirmSignInInput,
	AuthConfirmSignUpInput,
	AuthConfirmUserAttributeInput,
	AuthDeleteUserAttributesInput,
	AuthForgetDeviceInput,
	AuthResendSignUpCodeInput,
	AuthResetPasswordInput,
	AuthSendUserAttributeVerificationCodeInput,
	AuthSignInInput,
	AuthSignInWithRedirectInput,
	AuthSignOutInput,
	AuthSignUpInput,
	AuthUpdatePasswordInput,
	AuthUpdateUserAttributeInput,
	AuthUpdateUserAttributesInput,
	AuthVerifyTOTPSetupInput,
} from '../../../types';

/**
 * Input type for Cognito confirmResetPassword API.
 */
export type ConfirmResetPasswordInput =
	AuthConfirmResetPasswordInput<ConfirmResetPasswordOptions>;

/**
 * Input type for Cognito confirmSignIn API.
 */
export type ConfirmSignInInput = AuthConfirmSignInInput<ConfirmSignInOptions>;

/**
 * Input type for Cognito confirmSignUp API.
 */
export type ConfirmSignUpInput = AuthConfirmSignUpInput<ConfirmSignUpOptions>;

/**
 * Input type for Cognito confirmUserAttribute API.
 */
export type ConfirmUserAttributeInput =
	AuthConfirmUserAttributeInput<AuthVerifiableAttributeKey>;

/**
 * Input type for Cognito resendSignUpCode API.
 */
export type ResendSignUpCodeInput =
	AuthResendSignUpCodeInput<ResendSignUpCodeOptions>;

/**
 * Input type for Cognito resetPassword API.
 */
export type ResetPasswordInput = AuthResetPasswordInput<ResetPasswordOptions>;

/**
 * Input type for Cognito signIn API.
 */
export type SignInInput = AuthSignInInput<SignInOptions>;

/**
 * Input type for Cognito signInWithCustomAuth API.
 */
export type SignInWithCustomAuthInput = AuthSignInInput<SignInOptions>;

/**
 * Input type for Cognito signInWithCustomSRPAuth API.
 */
export type SignInWithCustomSRPAuthInput = AuthSignInInput<SignInOptions>;

/**
 * Input type for Cognito signInWithSRP API.
 */
export type SignInWithSRPInput = AuthSignInInput<SignInOptions>;

/**
 * Input type for Cognito signInWithUserPasswordInput API.
 */
export type SignInWithUserPasswordInput = AuthSignInInput<SignInOptions>;

/**
 * Input type for Cognito signInWithRedirect API.
 */
export type SignInWithRedirectInput = AuthSignInWithRedirectInput;

/**
 * Input type for Cognito signOut API.
 */
export type SignOutInput = AuthSignOutInput;

/**
 * Input type for Cognito signUp API.
 */
export type SignUpInput = AuthSignUpInput<SignUpOptions<UserAttributeKey>>;

/**
 * Input type for Cognito updateMFAPreference API.
 */
export interface UpdateMFAPreferenceInput {
	sms?: MFAPreference;
	totp?: MFAPreference;
}

/**
 * Input type for Cognito updatePassword API.
 */
export type UpdatePasswordInput = AuthUpdatePasswordInput;

/**
 * Input type for Cognito updateUserAttributes API.
 */
export type UpdateUserAttributesInput = AuthUpdateUserAttributesInput<
	UserAttributeKey,
	UpdateUserAttributesOptions
>;

/**
 * Input type for Cognito verifyTOTPSetup API.
 */
export type VerifyTOTPSetupInput =
	AuthVerifyTOTPSetupInput<VerifyTOTPSetupOptions>;

/**
 * Input type for Cognito sendUserAttributeVerificationCode API.
 */
export type SendUserAttributeVerificationCodeInput =
	AuthSendUserAttributeVerificationCodeInput<
		VerifiableUserAttributeKey,
		SendUserAttributeVerificationCodeOptions
	>;

/**
 * Input type for Cognito updateUserAttribute API.
 */
export type UpdateUserAttributeInput = AuthUpdateUserAttributeInput<
	UserAttributeKey,
	UpdateUserAttributeOptions
>;

/**
 * Input type for Cognito deleteUserAttributes API.
 */
export type DeleteUserAttributesInput =
	AuthDeleteUserAttributesInput<UserAttributeKey>;

/**
 * Input type for Cognito forgetDevice API.
 */
export type ForgetDeviceInput = AuthForgetDeviceInput;

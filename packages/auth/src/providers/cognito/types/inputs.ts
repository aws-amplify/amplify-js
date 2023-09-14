// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	MFAPreference,
	ConfirmResetPasswordOptions,
	ConfirmSignInOptions,
	ConfirmSignUpOptions,
	CognitoUserAttributeKey,
	ResendSignUpCodeOptions,
	ResetPasswordOptions,
	SignInOptions,
	SignUpOptions,
	UpdateUserAttributesOptions,
	VerifyTOTPSetupOptions,
} from '../types';
import {
	AuthGetCurrentUserInput,
	AuthConfirmResetPasswordInput,
	AuthConfirmSignInInput,
	AuthConfirmSignUpInput,
	AuthConfirmUserAttributeInput,
	AuthResendSignUpCodeInput,
	AuthResetPasswordInput,
	AuthSignInInput,
	AuthSignInWithRedirectInput,
	AuthSignOutInput,
	AuthSignUpInput,
	AuthUpdatePasswordInput,
	AuthUpdateUserAttributesInput,
	AuthVerifyTOTPSetupInput,
} from '../../../types';

export type GetCurrentUserInput = AuthGetCurrentUserInput;

export type ConfirmResetPasswordInput =
	AuthConfirmResetPasswordInput<ConfirmResetPasswordOptions>;

export type ConfirmSignInInput = AuthConfirmSignInInput<ConfirmSignInOptions>;

export type ConfirmSignUpInput = AuthConfirmSignUpInput<ConfirmSignUpOptions>;

export type ConfirmUserAttributeInput =
	AuthConfirmUserAttributeInput<CognitoUserAttributeKey>;

export type ResendSignUpCodeInput =
	AuthResendSignUpCodeInput<ResendSignUpCodeOptions>;

export type ResetPasswordInput = AuthResetPasswordInput<ResetPasswordOptions>;

export type SignInInput = AuthSignInInput<SignInOptions>;

export type SignInWithCustomAuthInput = AuthSignInInput<SignInOptions>;

export type SignInWithCustomSRPAuthInput = AuthSignInInput<SignInOptions>;

export type SignInWithSRPInput = AuthSignInInput<SignInOptions>;

export type SignInWithUserPasswordInput = AuthSignInInput<SignInOptions>;

export type SignInWithRedirectInput = AuthSignInWithRedirectInput;

export type SignOutInput = AuthSignOutInput;

export type SignUpInput = AuthSignUpInput<
	CognitoUserAttributeKey,
	SignUpOptions
>;

export type UpdateMFAPreferenceInput = {
	sms?: MFAPreference;
	totp?: MFAPreference;
};

export type UpdatePasswordInput = AuthUpdatePasswordInput;

export type UpdateUserAttributesInput = AuthUpdateUserAttributesInput<
	CognitoUserAttributeKey,
	UpdateUserAttributesOptions
>;

export type VerifyTOTPSetupInput =
	AuthVerifyTOTPSetupInput<VerifyTOTPSetupOptions>;

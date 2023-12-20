// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthVerifiableAttributeKey } from '@aws-amplify/core/internals/utils';
import {
	MFAPreference,
	ConfirmResetPasswordOptions,
	ConfirmSignInOptions,
	ConfirmSignUpOptions,
	UserAttributeKey,
	VerifiableUserAttributeKey,
	ResendSignUpCodeOptions,
	ResetPasswordOptions,
	SignInOptions,
	SignUpOptions,
	UpdateUserAttributesOptions,
	UpdateUserAttributeOptions,
	VerifyTOTPSetupOptions,
	SendUserAttributeVerificationCodeOptions,
} from '../types';
import {
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
	AuthUpdateUserAttributeInput,
	AuthVerifyTOTPSetupInput,
	AuthSendUserAttributeVerificationCodeInput,
	AuthDeleteUserAttributesInput,
	AuthForgetDeviceInput,
} from '../../../types';
import {
	SignInPasswordlessOptions,
	SignUpPasswordlessOptions,
} from './options';

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
export type SignInInput = SignInInputWithOptionalPassword;

export type SignInInputWithOptionalPassword = AuthSignInInput<SignInOptions> & {
	passwordless?: never;
};

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
export type SignInWithUserPasswordInput = AuthSignInInput<SignInOptions> & {
	passwordless?: never;
};

type SignInPasswordlessInput<
	DeliveryMedium extends 'EMAIL' | 'SMS',
	Method extends 'MAGIC_LINK' | 'OTP',
> = {
	username: string;
	password?: never;
	passwordless: {
		deliveryMedium: DeliveryMedium;
		method: Method;
	};
	options?: SignInPasswordlessOptions;
};

/**
 * The parameters to construct sign-in input without a password. Users will be
 * signed-in with a Magic Link sent to their device via registered email.
 *
 * This input interface can only be used with proper passwordless configuration
 * in the backend.
 *
 * See {@link https://docs.amplify.aws/gen2/build-a-backend/auth/}
 */
export type SignInPasswordlessWithEmailAndMagicLinkInput =
	SignInPasswordlessInput<'EMAIL', 'MAGIC_LINK'>;

/**
 * The parameters to construct sign-in input without a password. Users will be
 * signed-in with an One-time pin sent to their device via registered email.
 *
 * This input interface can only be used with proper passwordless configuration
 * in the backend.
 *
 * See {@link https://docs.amplify.aws/gen2/build-a-backend/auth/}
 */
export type SignInPasswordlessWithEmailAndOTPInput = SignInPasswordlessInput<
	'EMAIL',
	'OTP'
>;

/**
 * The parameters to construct sign-in input without a password. Users will be
 * signed-in with an One-time pin sent to their device via SMS.
 *
 * This input interface can only be used with proper passwordless configuration
 * in the backend.
 *
 * See {@link https://docs.amplify.aws/gen2/build-a-backend/auth/}
 */

export type SignInPasswordlessWithSMSAndOTPInput = SignInPasswordlessInput<
	'SMS',
	'OTP'
>;

/**
 * Input type for Cognito signInWithRedirect API.
 */
export type SignInWithRedirectInput = AuthSignInWithRedirectInput;

/**
 * Input type for Cognito signOut API.
 */
export type SignOutInput = AuthSignOutInput;

/**
 * @internal
 */
export type SignUpWithOptionalPasswordInput = AuthSignUpInput<
	SignUpOptions<UserAttributeKey>
> & {
	passwordless?: never;
};

/**
 * Input type for Cognito signUp API.
 */
export type SignUpInput = SignUpWithOptionalPasswordInput;

type SignUpPasswordlessInput<
	DeliveryMedium extends 'EMAIL' | 'SMS',
	Method extends 'MAGIC_LINK' | 'OTP',
	RequiredAttribute extends VerifiableUserAttributeKey,
> = {
	username: string;
	password?: never;
	passwordless: {
		deliveryMedium: DeliveryMedium;
		method: Method;
	};
	options: SignUpPasswordlessOptions<RequiredAttribute>;
};

/**
 * The parameters to construct sign-up input without a password. Users will be
 * signed-up with a Magic Link sent to their device via registered email.
 *
 * This input interface can only be used with proper passwordless configuration
 * in the backend.
 *
 * See {@link https://docs.amplify.aws/gen2/build-a-backend/auth/}
 */
export type SignUpPasswordlessWithEmailAndMagicLinkInput =
	SignUpPasswordlessInput<'EMAIL', 'MAGIC_LINK', 'email'>;

/**
 * The parameters to construct sign-up input without a password. Users will be
 * signed-up with an One-time pin sent to their device via registered email.
 *
 * This input interface can only be used with proper passwordless configuration
 * in the backend.
 *
 * See {@link https://docs.amplify.aws/gen2/build-a-backend/auth/}
 */
export type SignUpPasswordlessWithEmailAndOTPInput = SignUpPasswordlessInput<
	'EMAIL',
	'OTP',
	'email'
>;

/**
 * The parameters to construct sign-up input without a password. Users will be
 * signed-up with an One-time pin sent to their device via SMS.
 *
 * This input interface can only be used with proper passwordless configuration
 * in the backend.
 *
 * See {@link https://docs.amplify.aws/gen2/build-a-backend/auth/}
 */
export type SignUpPasswordlessWithSMSAndOTPInput = SignUpPasswordlessInput<
	'SMS',
	'OTP',
	'phone_number'
>;

/**
 * Input type for Cognito updateMFAPreference API.
 */
export type UpdateMFAPreferenceInput = {
	sms?: MFAPreference;
	totp?: MFAPreference;
};

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

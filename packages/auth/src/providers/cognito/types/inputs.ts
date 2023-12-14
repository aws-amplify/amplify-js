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
	SignInWithEmailOptions,
	SignInWithSMSOptions,
	SignUpWithEmailOptions,
	SignUpWithSMSOptions,
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
	passwordlessConnection?: never;
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
export type SignInWithUserPasswordInput = AuthSignInInput<SignInOptions>;

export type SignInWithEmailInput<
	PasswordlessMethod extends 'MAGIC_LINK' | 'OTP',
> = AuthSignInInput & {
	password?: never;
	/**
	 * Use email instead of password to sign in.
	 *
	 * @note Setting this value requires backend setup with Amplify CLI.
	 * see {@link https://docs.amplify.aws/gen2/build-a-backend/auth/}
	 */
	passwordlessConnection: 'EMAIL';
	options: SignInWithEmailOptions<PasswordlessMethod>;
};

export type SignInWithSMSInput = AuthSignInInput & {
	password?: never;
	/**
	 * Use SMS instead of password to sign in.
	 *
	 * @note Setting this value requires backend setup with Amplify CLI.
	 * see {@link https://docs.amplify.aws/gen2/build-a-backend/auth/}
	 */
	passwordlessConnection: 'SMS';
	options: SignInWithSMSOptions;
};

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
export type SignUpInput = SignUpInputWithOptionalPassword;

type SignUpInputWithOptionalPassword = AuthSignUpInput<
	SignUpOptions<UserAttributeKey>
> & {
	password: string;
	passwordlessConnection?: never;
};

export type SignUpWithEmailInput<
	PasswordlessMethod extends 'MAGIC_LINK' | 'OTP',
> = {
	username: string;
	password?: never;
	passwordlessConnection: 'EMAIL';
	// TODO: require respective user attribute key based on deliveryMedium
	// TODO: verify if validationData is supported for passwordless flow
	options: SignUpWithEmailOptions<PasswordlessMethod, 'email'>;
};

export type SignUpWithSMSInput = {
	username: string;
	password?: never;
	passwordlessConnection: 'SMS';
	// TODO: require respective user attribute key based on deliveryMedium
	// TODO: verify if validationData is supported for passwordless flow
	options: SignUpWithSMSOptions<'phone_number'>;
};

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

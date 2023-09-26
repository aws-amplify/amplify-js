// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthUserAttributes, AuthUserAttributeKey } from './models';
import { AuthServiceOptions, AuthSignUpOptions } from './options';

export type AuthConfirmResetPasswordInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	newPassword: string;
	confirmationCode: string;
	options?: {
		serviceOptions?: ServiceOptions;
	};
};

/**
 * The parameters for constructing a Resend Sign Up code input.
 *
 * @param username - a standard username, potentially an email/phone number
 * @param options - optional parameters for the Sign Up process such as the plugin options
 */
export type AuthResendSignUpCodeInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	options?: { serviceOptions?: ServiceOptions };
};

export type AuthResetPasswordInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	options?: {
		serviceOptions?: ServiceOptions;
	};
};

export type AuthSignInInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	password?: string;
	options?: { serviceOptions?: ServiceOptions };
};
export type AuthSignOutInput = {
	global: boolean;
};

export type AuthProvider = 'Amazon' | 'Apple' | 'Facebook' | 'Google';

export type AuthSignInWithRedirectInput = {
	provider?: AuthProvider | { custom: string };
	customState?: string;
};

/**
 * The parameters for constructing a Sign Up input.
 *
 * @param username - a standard username, potentially an email/phone number
 * @param password - the user's password
 * @param options - optional parameters for the Sign Up process, including user attributes
 */
export type AuthSignUpInput<
	AttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	password: string;
	options?: AuthSignUpOptions<AttributeKey, ServiceOptions>;
};

/**
 *  Constructs a `confirmSignUp` input.
 *
 * @param username - a standard username, potentially an email/phone number
 * @param confirmationCode - the user's confirmation code sent to email or cellphone
 * @param options - optional parameters for the Sign Up process, including user attributes
 */
export type AuthConfirmSignUpInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	confirmationCode: string;
	options?: {
		serviceOptions?: ServiceOptions;
	};
};
/**
 * Constructs a `confirmSignIn` input.
 *
 * @param challengeResponse - required parameter for responding to {@link AuthSignInStep } returned during
 * the sign in process.
 * @param options - optional parameters for the Confirm Sign In process such as the service options
 */
export type AuthConfirmSignInInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	challengeResponse: string;
	options?: { serviceOptions?: ServiceOptions };
};

/**
 * Constructs a `VerifyTOTPSetup` input.
 *
 * @param code - required parameter for verifying the TOTP setup.
 * @param options - optional parameters for the Verify TOTP Setup process such as the service options.
 */
export type AuthVerifyTOTPSetupInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	code: string;
	options?: { serviceOptions?: ServiceOptions };
};

/**
 * Constructs a `updatePassword` input.
 *
 * @param oldPassword - previous password used for `signIn`
 * @param newPassword - new password to be used for `signIn`
 */
export type AuthUpdatePasswordInput = {
	oldPassword: string;
	newPassword: string;
};

/**
 * Constructs a `updateUserAttributes` input.
 *
 * @param userAttributes - the user attributes to be updated
 * @param options - optional parameters for the Update User Attributes process such as the service options.
 */
export type AuthUpdateUserAttributesInput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	userAttributes: AuthUserAttributes<UserAttributeKey>;
	options?: { serviceOptions?: ServiceOptions };
};

/**
 * Constructs a `verifyUserAttribute` input.
 *
 * @param userAttributeKey - the user attribute key to be verified
 * @param confirmationCode - the user attribute verification code sent to email or cellphone
 *
 */
export type AuthConfirmUserAttributeInput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = { userAttributeKey: UserAttributeKey; confirmationCode: string };

/**
 * Constructs a `sendUserAttributeVerificationCode` request.
 *
 * @param userAttributeKey - the user attribute key
 * @param options - optional parameters for the Resend Attribute Code process such as the service options.
 */
export type AuthSendUserAttributeVerificationCodeInput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	userAttributeKey: UserAttributeKey;
	options?: { serviceOptions?: ServiceOptions };
};

/**
 * Constructs a `deleteUserAttributes` input.
 *
 * @param userAttributeKeys - the user attribute keys to be deleted
 */
export type AuthDeleteUserAttributesInput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = { userAttributeKeys: UserAttributeKey[] };

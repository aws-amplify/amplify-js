// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthDevice,
	AuthUserAttribute,
	AuthUserAttributeKey,
	AuthUserAttributes,
} from './models';
import { AuthServiceOptions, AuthSignUpOptions } from './options';

export interface AuthConfirmResetPasswordInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions,
> {
	username: string;
	newPassword: string;
	confirmationCode: string;
	options?: ServiceOptions;
}

/**
 * The parameters for constructing a Resend Sign Up code input.
 *
 * @param username - a standard username, potentially an email/phone number
 * @param options - optional parameters for the Sign Up process such as the plugin options
 */
export interface AuthResendSignUpCodeInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions,
> {
	username: string;
	options?: ServiceOptions;
}

export interface AuthResetPasswordInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions,
> {
	username: string;
	options?: ServiceOptions;
}

export interface AuthSignInInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions,
> {
	username: string;
	password?: string;
	options?: ServiceOptions;
}
export interface AuthSignOutInput {
	global: boolean;
	oauth?: {
		redirectUrl?: string;
	};
}

export type AuthProvider = 'Amazon' | 'Apple' | 'Facebook' | 'Google';

export interface AuthSignInWithRedirectInput {
	provider?: AuthProvider | { custom: string };
	customState?: string;
	options?: {
		/**
		 * On iOS devices, setting this to true requests that the browser not share cookies or other browsing data between
		 * the authentication session and the user’s normal browser session. This will bypass the permissions dialog that
		 * is displayed your user during sign-in and sign-out but also prevents reuse of existing sessions from the user's
		 * browser, requiring them to re-enter their credentials even if they are already externally logged in on their
		 * browser.
		 *
		 * On all other platforms, this flag is ignored.
		 */
		preferPrivateSession?: boolean;
	};
}

/**
 * The parameters for constructing a Sign Up input.
 *
 * @param username - a standard username, potentially an email/phone number
 * @param password - the user's password, may be required depending on your Cognito User Pool configuration
 * @param options - optional parameters for the Sign Up process, including user attributes
 */
export interface AuthSignUpInput<
	ServiceOptions extends
		AuthSignUpOptions<AuthUserAttributeKey> = AuthSignUpOptions<AuthUserAttributeKey>,
> {
	username: string;
	password?: string;
	options?: ServiceOptions;
}

/**
 *  Constructs a `confirmSignUp` input.
 *
 * @param username - a standard username, potentially an email/phone number
 * @param confirmationCode - the user's confirmation code sent to email or cellphone
 * @param options - optional parameters for the Sign Up process, including user attributes
 */
export interface AuthConfirmSignUpInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions,
> {
	username: string;
	confirmationCode: string;
	options?: ServiceOptions;
}

/**
 * Constructs a `confirmSignIn` input.
 *
 * @param challengeResponse - required parameter for responding to `AuthSignInStep` returned during
 * the sign in process.
 * @param options - optional parameters for the Confirm Sign In process such as the service options
 */
export interface AuthConfirmSignInInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions,
> {
	challengeResponse: string;
	options?: ServiceOptions;
}

/**
 * Constructs a `VerifyTOTPSetup` input.
 *
 * @param code - required parameter for verifying the TOTP setup.
 * @param options - optional parameters for the Verify TOTP Setup process such as the service options.
 */
export interface AuthVerifyTOTPSetupInput<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions,
> {
	code: string;
	options?: ServiceOptions;
}

/**
 * Constructs a `updatePassword` input.
 *
 * @param oldPassword - previous password used for `signIn`
 * @param newPassword - new password to be used for `signIn`
 */
export interface AuthUpdatePasswordInput {
	oldPassword: string;
	newPassword: string;
}

/**
 * Constructs a `updateUserAttributes` input.
 *
 * @param userAttributes - the user attributes to be updated
 * @param options - optional parameters for the Update User Attributes process such as the service options.
 */
export interface AuthUpdateUserAttributesInput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions,
> {
	userAttributes: AuthUserAttributes<UserAttributeKey>;
	options?: ServiceOptions;
}

/**
 * Constructs a `updateUserAttributes` input.
 * @param userAttributes - the user attribute to be updated
 * @param options - optional parameters for the Update User Attributes process such as the service options.
 */
export interface AuthUpdateUserAttributeInput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions,
> {
	userAttribute: AuthUserAttribute<UserAttributeKey>;
	options?: ServiceOptions;
}

/*
 * Constructs a `verifyUserAttribute` input.
 *
 * @param userAttributeKey - the user attribute key to be verified
 * @param confirmationCode - the user attribute verification code sent to email or cellphone
 *
 */
export interface AuthConfirmUserAttributeInput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	userAttributeKey: UserAttributeKey;
	confirmationCode: string;
}

/**
 * Constructs a `sendUserAttributeVerificationCode` request.
 *
 * @param userAttributeKey - the user attribute key
 * @param options - optional parameters for the Resend Attribute Code process such as the service options.
 */
export interface AuthSendUserAttributeVerificationCodeInput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions,
> {
	userAttributeKey: UserAttributeKey;
	options?: ServiceOptions;
}

/**
 * Constructs a `deleteUserAttributes` input.
 *
 * @param userAttributeKeys - the user attribute keys to be deleted
 */
export interface AuthDeleteUserAttributesInput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	userAttributeKeys: [UserAttributeKey, ...UserAttributeKey[]];
}

/**
 * Constructs a `forgetDevice` input.
 *
 * @param device - optional parameter to forget an external device
 */
export interface AuthForgetDeviceInput {
	device?: AuthDevice;
}

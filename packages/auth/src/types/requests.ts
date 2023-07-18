// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthUserAttributeKey } from './models';
import { AuthServiceOptions, AuthSignUpOptions } from './options';

export type ConfirmResetPasswordRequest<
	ServiceOptions extends AuthServiceOptions
> = {
	username: string;
	newPassword: string;
	confirmationCode: string;
	options?: {
		serviceOptions?: ServiceOptions;
	};
};

/**
 * The parameters for constructing a Resend Sign Up code request.
 *
 * @param username - a standard username, potentially an email/phone number
 * @param options - optional parameters for the Sign Up process such as the plugin options
 */
export type ResendSignUpCodeRequest<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	options?: { serviceOptions?: ServiceOptions };
};

export type ResetPasswordRequest<ServiceOptions extends AuthServiceOptions> = {
	username: string;
	options?: {
		serviceOptions?: ServiceOptions;
	};
};

export type SignInRequest<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	password?: string;
	options?: { serviceOptions?: ServiceOptions };
};

/**
 * The parameters for constructing a Sign Up request.
 *
 * @param username - a standard username, potentially an email/phone number
 * @param password - the user's password
 * @param options - optional parameters for the Sign Up process, including user attributes
 */
export type SignUpRequest<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	password: string;
	options?: AuthSignUpOptions<UserAttributeKey, ServiceOptions>;
};

/**
 *  Constructs a `confirmSignUp` request.
 *
 * @param username - a standard username, potentially an email/phone number
 * @param confirmationCode - the user's confirmation code sent to email or cellphone
 * @param options - optional parameters for the Sign Up process, including user attributes
 */
export type ConfirmSignUpRequest<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	username: string;
	confirmationCode: string;
	options?: {
		serviceOptions?: ServiceOptions;
	};
};
/**
 * Constructs a `confirmSignIn` request.
 *
 * @param challengeResponse - required parameter for responding to {@link AuthSignInStep } returned during
 * the sign in process.
 * @param options - optional parameters for the Confirm Sign In process such as the plugin options
 */
export type ConfirmSignInRequest<
	ServiceOptions extends AuthServiceOptions = AuthServiceOptions
> = {
	challengeResponse: string;
	options?: { serviceOptions?: ServiceOptions };
};

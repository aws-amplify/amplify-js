// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthUserAttributeKey,
	AuthNextSignInStep,
	AuthNextSignUpStep,
	AuthNextResetPasswordStep,
} from './models';

/**
 * The Result of a Sign In request.
 */
export type AuthSignInResult<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	isSignedIn: boolean;
	nextStep: AuthNextSignInStep<UserAttributeKey>;
};

/**
 * The Result of a Sign Up request.
 */
export type AuthSignUpResult<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	isSignUpComplete: boolean;
	nextStep: AuthNextSignUpStep<UserAttributeKey>;
	userId?: string;
};

/**
 * The Result of a Reset Password request.
 */
export type ResetPasswordResult<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	isPasswordReset: boolean;
	nextStep: AuthNextResetPasswordStep<UserAttributeKey>;
};

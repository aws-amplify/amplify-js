// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthNextResetPasswordStep,
	AuthNextSignInStep,
	AuthNextSignUpStep,
	AuthNextUpdateAttributeStep,
	AuthUserAttributeKey,
} from './models';

export interface AuthSignInOutput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	isSignedIn: boolean;
	nextStep: AuthNextSignInStep<UserAttributeKey>;
}

export interface AuthSignUpOutput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	isSignUpComplete: boolean;
	userId?: string;
	nextStep: AuthNextSignUpStep<UserAttributeKey>;
}

export interface AuthResetPasswordOutput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	isPasswordReset: boolean;
	nextStep: AuthNextResetPasswordStep<UserAttributeKey>;
}

export interface AuthUpdateUserAttributeOutput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> {
	isUpdated: boolean;
	nextStep: AuthNextUpdateAttributeStep<UserAttributeKey>;
}

export type AuthUpdateUserAttributesOutput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = Record<UserAttributeKey, AuthUpdateUserAttributeOutput<UserAttributeKey>>;

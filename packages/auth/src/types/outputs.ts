// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthUserAttributeKey,
	AuthNextSignInStep,
	AuthNextSignUpStep,
	AuthNextResetPasswordStep,
	AuthNextUpdateAttributeStep,
	AuthConfirmSignInWithOTPStep,
	DoneSignInStep,
	AuthConfirmSignInWithMagicLinkStep,
} from './models';

export type AuthSignInOutput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
	isSignedIn: boolean;
	nextStep: AuthNextSignInStep<UserAttributeKey>;
};

export type AuthSignUpOutput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
	isSignUpComplete: boolean;
	userId?: string;
	nextStep: AuthNextSignUpStep<UserAttributeKey>;
};

export type AuthResetPasswordOutput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
	isPasswordReset: boolean;
	nextStep: AuthNextResetPasswordStep<UserAttributeKey>;
};

export type AuthUpdateUserAttributeOutput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
	isUpdated: boolean;
	nextStep: AuthNextUpdateAttributeStep<UserAttributeKey>;
};

export type AuthUpdateUserAttributesOutput<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
> = {
	[authKey in UserAttributeKey]: AuthUpdateUserAttributeOutput<UserAttributeKey>;
};

// export type AuthSignInWithOTPOutput<
// 	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
// > = {
// 	isSignedIn: boolean;
// 	nextStep: AuthConfirmSignInWithOTPStep<UserAttributeKey>;
// };

// export type AuthConfirmSignInWithOTPOutput = {
// 	isSignedIn: boolean;
// 	nextStep: DoneSignInStep;
// };

// export type AuthSignInWithMagicLinkOutput<
// 	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey,
// > = {
// 	isSignedIn: boolean;
// 	nextStep: AuthConfirmSignInWithMagicLinkStep<UserAttributeKey>;
// };

// export type AuthConfirmSignInWithMagicLinkOutput =
// 	AuthConfirmSignInWithOTPOutput;

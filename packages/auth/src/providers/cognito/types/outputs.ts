// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthVerifiableAttributeKey } from '@aws-amplify/core/internals/utils';
import {
	AuthMFAType,
	AuthUserAttributes,
	AuthCodeDeliveryDetails,
	AuthTOTPSetupDetails,
	AuthSignInOutput,
	AuthSignUpOutput,
	AuthResetPasswordOutput,
	AuthUpdateUserAttributesOutput,
	AuthUpdateUserAttributeOutput,
} from '../../../types';
import { AWSAuthDevice, AuthUser, UserAttributeKey } from '../types';
import {
	ConfirmSignInWithMagicLinkSignUpStep,
	ConfirmSignInWithMagicLinkStep,
	ConfirmSignInWithOTPSignUpStep,
	ConfirmSignInWithOTPStep,
} from './models';

export type FetchMFAPreferenceOutput = {
	enabled?: AuthMFAType[];
	preferred?: AuthMFAType;
};

/**
 * Output type for Cognito fetchUserAttributes API.
 */
export type FetchUserAttributesOutput = AuthUserAttributes<UserAttributeKey>;

/**
 * Output type for Cognito getCurrentUser API.
 */
export type GetCurrentUserOutput = AuthUser;

/**
 * Output type for Cognito confirmSignIn API.
 */
export type ConfirmSignInOutput = AuthSignInOutput;

/**
 * Output type for Cognito confirmSignUp API.
 */
export type ConfirmSignUpOutput = AuthSignUpOutput<AuthVerifiableAttributeKey>;

/**
 * Output type for Cognito resendSignUpCode API.
 */
export type ResendSignUpCodeOutput =
	AuthCodeDeliveryDetails<AuthVerifiableAttributeKey>;

/**
 * Output type for Cognito resetPassword API.
 */
export type ResetPasswordOutput =
	AuthResetPasswordOutput<AuthVerifiableAttributeKey>;

/**
 * Output type for Cognito setUpTOTP API.
 */
export type SetUpTOTPOutput = AuthTOTPSetupDetails;

/**
 * Output type for Cognito signIn API.
 */
export type SignInOutput = SignInWithPasswordOutput;

/**
 * Output type for Cognito signIn APIs. This type is a generic type for sign-in
 * output types with password, including
 * * {@link SignInWithCustomAuthOutput}
 * * {@link SignInWithCustomSRPAuthOutput}
 * * {@link SignInWithSRPOutput}
 * * {@link SignInWithUserPasswordOutput}
 *
 * The name of this type differs from the output type for the passwordless flows, including
 * * {@link SignInWithEmailAndMagicLinkOutput}
 * * {@link SignInWithEmailAndOTPOutput}
 * * {@link SignInWithSMSAndOTPOutput}.
 *
 * Use {@link SignInOutput} interface publicly for backward compatibility.
 * @internal
 */
export type SignInWithPasswordOutput = AuthSignInOutput;

/**
 * Output type for Cognito signInWithCustomAuth API.
 */
export type SignInWithCustomAuthOutput = AuthSignInOutput;

/**
 * Output type for Cognito signInWithSRP API.
 */
export type SignInWithSRPOutput = AuthSignInOutput;

/**
 * Output type for Cognito signInWithUserPassword API.
 */
export type SignInWithUserPasswordOutput = AuthSignInOutput;

/**
 * Output type for Cognito signInWithCustomSRPAuth API.
 */
export type SignInWithCustomSRPAuthOutput = AuthSignInOutput;

/**
 * Output type for Cognito signUp API.
 */
export type SignUpOutput = SignUpWithPasswordOutput;

/**
 * Output type for Cognito signIn APIs. The name of this type differs from the output type for the passwordless flows,
 * including
 * * {@link SignUpWithEmailAndMagicLinkOutput}
 * * {@link SignUpWithEmailAndOTPOutput}
 * * {@link SignUpWithSMSAndOTPOutput}.
 *
 * Use {@link SignUpOutput} interface publicly for backward compatibility.
 * @internal
 */
export type SignUpWithPasswordOutput =
	AuthSignUpOutput<AuthVerifiableAttributeKey>;

export type SignUpWithEmailAndMagicLinkOutput = {
	isSignUpComplete: boolean;
	nextStep: ConfirmSignInWithMagicLinkSignUpStep;
};

export type SignUpWithEmailAndOTPOutput = {
	isSignUpComplete: boolean;
	nextStep: ConfirmSignInWithOTPSignUpStep;
};

export type SignUpWithSMSAndOTPOutput = {
	isSignUpComplete: boolean;
	nextStep: ConfirmSignInWithOTPSignUpStep;
};

/**
 * Output type for Cognito updateUserAttributes API.
 */
export type UpdateUserAttributesOutput =
	AuthUpdateUserAttributesOutput<UserAttributeKey>;

/**
 * Output type for Cognito sendUserAttributeVerificationCode API.
 */
export type SendUserAttributeVerificationCodeOutput =
	AuthCodeDeliveryDetails<AuthVerifiableAttributeKey>;

/**
 * Output type for Cognito updateUserAttribute API.
 */
export type UpdateUserAttributeOutput =
	AuthUpdateUserAttributeOutput<UserAttributeKey>;

/**
 * Output type for Cognito fetchDevices API.
 */
export type FetchDevicesOutput = AWSAuthDevice[];

export type SignInWithEmailAndMagicLinkOutput = {
	isSignedIn: boolean;
	nextStep: ConfirmSignInWithMagicLinkStep;
};

export type SignInWithEmailAndOTPOutput = {
	isSignedIn: boolean;
	nextStep: ConfirmSignInWithOTPStep;
};

export type SignInWithSMSAndOTPOutput = {
	isSignedIn: boolean;
	nextStep: ConfirmSignInWithOTPStep;
};

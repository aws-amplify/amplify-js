// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthVerifiableAttributeKey } from '@aws-amplify/core/internals/utils';

import {
	AuthCodeDeliveryDetails,
	AuthMFAType,
	AuthResetPasswordOutput,
	AuthSignInOutput,
	AuthSignUpOutput,
	AuthTOTPSetupDetails,
	AuthUpdateUserAttributeOutput,
	AuthUpdateUserAttributesOutput,
	AuthUserAttributes,
} from '../../../types';
import { AWSAuthDevice, AuthUser, UserAttributeKey } from '../types';

export interface FetchMFAPreferenceOutput {
	enabled?: AuthMFAType[];
	preferred?: AuthMFAType;
}

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
export type SignInOutput = AuthSignInOutput;

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
export type SignUpOutput = AuthSignUpOutput<AuthVerifiableAttributeKey>;

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

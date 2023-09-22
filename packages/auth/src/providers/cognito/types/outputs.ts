// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthMFAType,
	AuthUserAttributes,
	AuthUser,
	AuthStandardAttributeKey,
	AuthCodeDeliveryDetails,
	AuthTOTPSetupDetails,
	AuthSignInOutput,
	AuthSignUpOutput,
	AuthResetPasswordOutput,
	AuthSignOutOutput,
	AuthUpdateUserAttributesOutput,
	AuthUpdateUserAttributeOutput,
} from '../../../types';
import { UserAttributeKey, CustomAttribute } from '../types';

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
export type ConfirmSignUpOutput = AuthSignUpOutput<
	AuthStandardAttributeKey | CustomAttribute
>;

/**
 * Output type for Cognito resendSignUpCode API.
 */
export type ResendSignUpCodeOutput = AuthCodeDeliveryDetails<UserAttributeKey>;

/**
 * Output type for Cognito resetPassword API.
 */
export type ResetPasswordOutput = AuthResetPasswordOutput<
	AuthStandardAttributeKey | CustomAttribute
>;

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
 * Output type for Cognito signOut API.
 */
export type SignOutOutput = AuthSignOutOutput;

/**
 * Output type for Cognito signUp API.
 */
export type SignUpOutput = AuthSignUpOutput<
	AuthStandardAttributeKey | CustomAttribute
>;

/**
 * Output type for Cognito updateUserAttributes API.
 */
export type UpdateUserAttributesOutput =
	AuthUpdateUserAttributesOutput<UserAttributeKey>;

/**
<<<<<<< Updated upstream
 * Output type for Cognito sendUserAttributeVerificationCode API.
 */
export type SendUserAttributeVerificationCodeOutput =
	AuthCodeDeliveryDetails<UserAttributeKey>;
=======
 * Output type for Cognito updateUserAttribute API.
 */
export type UpdateUserAttributeOutput =
	AuthUpdateUserAttributeOutput<UserAttributeKey>;
>>>>>>> Stashed changes

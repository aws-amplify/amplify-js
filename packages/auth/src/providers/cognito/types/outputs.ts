// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	MFAType,
	AuthUserAttribute,
	AuthUser,
	AuthStandardAttributeKey,
	AuthCodeDeliveryDetails,
	TOTPSetupDetails,
	AuthSignInOutput,
	AuthSignUpOutput,
	AuthResetPasswordOutput,
	AuthSignOutOutput,
	AuthUpdateUserAttributesOutput,
} from '../../../types';
import { CognitoUserAttributeKey, CustomAttribute } from '../types';

export type FetchMFAPreferenceOutput = {
	enabled?: MFAType[];
	preferred?: MFAType;
};

export type FetchUserAttributesOutput =
	AuthUserAttribute<CognitoUserAttributeKey>;

export type GetCurrentUserOutput = AuthUser;

export type ConfirmSignInOutput = AuthSignInOutput;

export type ConfirmSignUpOutput = AuthSignUpOutput<
	AuthStandardAttributeKey | CustomAttribute
>;

export type ResendSignUpCodeOutput =
	AuthCodeDeliveryDetails<CognitoUserAttributeKey>;

export type ResetPasswordOutput = AuthResetPasswordOutput<
	AuthStandardAttributeKey | CustomAttribute
>;

export type SetUpTOTPOutput = TOTPSetupDetails;

export type SignInOutput = AuthSignInOutput;

export type SignInWithCustomAuthOutput = AuthSignInOutput;

export type SignInWithSRPOutput = AuthSignInOutput;

export type SignInWithUserPasswordOutput = AuthSignInOutput;

export type SignInWithCustomSRPAuthOutput = AuthSignInOutput;

export type SignOutOutput = AuthSignOutOutput;

export type SignUpOutput = AuthSignUpOutput<
	AuthStandardAttributeKey | CustomAttribute
>;

export type UpdateUserAttributesOutput =
	AuthUpdateUserAttributesOutput<CognitoUserAttributeKey>;

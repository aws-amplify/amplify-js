// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: Remove "./Auth" export
export * from './Auth';

export {
	AdditionalInfo,
	DeliveryMedium,
	AnyAttribute,
	AuthCodeDeliveryDetails,
	AuthNextSignUpStep,
	AuthStandardAttributeKey,
	AuthUserAttributeKey,
	AuthUserAttribute,
	AuthNextResetPasswordStep,
	AuthNextSignInStep,
	AuthNextUpdateAttributeStep,
	MFAType,
	AllowedMFATypes,
	AuthUser,
	TOTPSetupDetails,
	AuthResetPasswordStep,
	AuthSignUpStep,
	AuthUpdateAttributeStep,
} from './models';

export { AuthServiceOptions, AuthSignUpOptions } from './options';

export {
	AuthConfirmResetPasswordInput,
	AuthResetPasswordInput,
	AuthResendSignUpCodeInput,
	AuthSignUpInput,
	AuthSignInInput,
	AuthConfirmSignUpInput,
	AuthConfirmSignInInput,
	AuthUpdatePasswordInput,
	AuthUpdateUserAttributesInput,
	AuthGetCurrentUserInput,
	AuthConfirmUserAttributeInput,
	AuthVerifyTOTPSetupInput,
	AuthSignInWithRedirectInput,
	AuthSignOutInput,
} from './inputs';

export {
	AuthSignUpOutput,
	AuthSignInOutput,
	AuthSignOutOutput,
	AuthResetPasswordOutput,
	AuthUpdateUserAttributeOutput,
	AuthUpdateUserAttributesOutput,
} from './outputs';

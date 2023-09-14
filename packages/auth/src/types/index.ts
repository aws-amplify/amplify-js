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
	ConfirmResetPasswordRequest,
	ResetPasswordRequest,
	ResendSignUpCodeRequest,
	SignUpRequest,
	SignInRequest,
	ConfirmSignUpRequest,
	ConfirmSignInRequest,
	UpdatePasswordRequest,
	UpdateUserAttributesRequest,
	GetCurrentUserRequest,
	ConfirmUserAttributeRequest,
	VerifyTOTPSetupRequest,
} from './requests';

export {
	AuthSignUpResult,
	AuthSignInResult,
	ResetPasswordResult,
	UpdateUserAttributeResult,
	UpdateUserAttributesResult,
} from './results';

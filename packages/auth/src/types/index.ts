// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO: Remove "./Auth" export
export * from './Auth';

export { AuthSignUpStep, AuthResetPasswordStep, AuthSignInStep } from './enums';

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
} from './requests';

export {
	AuthSignUpResult,
	AuthSignInResult,
	ResetPasswordResult,
	UpdateUserAttributeResult,
	UpdateUserAttributesResult,
} from './results';

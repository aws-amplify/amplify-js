// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthResetPasswordStep,
	AuthSignInStep,
	AuthSignUpStep,
	AuthUpdateAttributeStep,
} from './enums';

/**
 * Additional data that may be returned from Auth APIs.
 */
export type AdditionalInfo = { [key: string]: string };

export type AnyAttribute = string & {};

/**
 * Denotes the medium over which a confirmation code was sent.
 */
export type DeliveryMedium = 'EMAIL' | 'SMS' | 'PHONE' | 'UNKNOWN';

/**
 * Data describing the dispatch of a confirmation code.
 */
export type AuthCodeDeliveryDetails<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	destination?: string;
	deliveryMedium?: DeliveryMedium;
	attributeName?: UserAttributeKey;
};

export type AuthNextResetPasswordStep<
	UserAttributeKey extends AuthUserAttributeKey
> = {
	resetPasswordStep: AuthResetPasswordStep;
	additionalInfo?: AdditionalInfo;
	codeDeliveryDetails: AuthCodeDeliveryDetails<UserAttributeKey>;
};

export type TOTPSetupDetails = {
	sharedSecret: string;
	getSetupUri: (appName: string, accountName?: string) => URL;
};

export type MFAType = 'SMS' | 'TOTP';

export type AllowedMFATypes = MFAType[];

export type ContinueSignInWithTOTPSetup = {
	signInStep: AuthSignInStep.CONTINUE_SIGN_IN_WITH_TOTP_SETUP;
	totpSetupDetails: TOTPSetupDetails;
};
export type ConfirmSignInWithTOTPCode = {
	signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_TOTP_CODE;
};

export type ContinueSignInWithMFASelection = {
	signInStep: AuthSignInStep.CONTINUE_SIGN_IN_WITH_MFA_SELECTION;
	allowedMFATypes?: AllowedMFATypes;
};

export type ConfirmSignInWithCustomChallenge = {
	signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE;
	additionalInfo?: AdditionalInfo;
};

export type ConfirmSignInWithNewPasswordRequired<
	UserAttributeKey extends AuthUserAttributeKey
> = {
	signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED;
	missingAttributes?: UserAttributeKey[];
};

export type ConfirmSignInWithSMSCode = {
	signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_SMS_CODE;
	codeDeliveryDetails?: AuthCodeDeliveryDetails;
};

export type ConfirmSignUpStep = {
	signInStep: AuthSignInStep.CONFIRM_SIGN_UP;
};

export type ResetPasswordStep = {
	signInStep: AuthSignInStep.RESET_PASSWORD;
};

export type DoneStep = {
	signInStep: AuthSignInStep.DONE;
};

export type AuthNextSignInStep<UserAttributeKey extends AuthUserAttributeKey> =
	| ConfirmSignInWithCustomChallenge
	| ContinueSignInWithMFASelection
	| ConfirmSignInWithNewPasswordRequired<UserAttributeKey>
	| ConfirmSignInWithSMSCode
	| ConfirmSignInWithTOTPCode
	| ContinueSignInWithTOTPSetup
	| ConfirmSignUpStep
	| ResetPasswordStep
	| DoneStep;

export type AuthStandardAttributeKey =
	| 'address'
	| 'birthdate'
	| 'email'
	| 'email_verified'
	| 'family_name'
	| 'gender'
	| 'given_name'
	| 'locale'
	| 'middle_name'
	| 'name'
	| 'nickname'
	| 'phone_number'
	| 'phone_number_verified'
	| 'picture'
	| 'preferred_username'
	| 'profile'
	| 'sub'
	| 'updated_at'
	| 'website'
	| 'zoneinfo';

/**
 * Key/value pairs describing a user attribute.
 */
export type AuthUserAttribute<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	[Attribute in UserAttributeKey]?: string;
};

/**
 * A user attribute key type consisting of standard OIDC claims or custom attributes.
 */
export type AuthUserAttributeKey = AuthStandardAttributeKey | AnyAttribute;

export type GetAttributeKey<T> = T extends string ? T : string;

/**
 * Data encapsulating the next step in the Sign Up process
 */
export type AuthNextSignUpStep<UserAttributeKey extends AuthUserAttributeKey> =
	{
		signUpStep?: AuthSignUpStep;
		additionalInfo?: AdditionalInfo;
		codeDeliveryDetails?: AuthCodeDeliveryDetails<UserAttributeKey>;
	};

export type ConfirmAttributeWithCodeAttributeStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = {
	updateAttributeStep: AuthUpdateAttributeStep.CONFIRM_ATTRIBUTE_WITH_CODE;
	additionalInfo: AdditionalInfo;
	codeDeliveryDetails: AuthCodeDeliveryDetails<UserAttributeKey>;
};

export type DoneAttributeStep = {
	updateAttributeStep: AuthUpdateAttributeStep.DONE;
};

export type AuthNextUpdateAttributeStep<
	UserAttributeKey extends AuthUserAttributeKey = AuthUserAttributeKey
> = ConfirmAttributeWithCodeAttributeStep<UserAttributeKey> | DoneAttributeStep;

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthResetPasswordStep, AuthSignInStep, AuthSignUpStep } from './enums';

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

export type AuthNextSignInStep<UserAttributeKey extends AuthUserAttributeKey> =
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE;
			additionalInfo?: AdditionalInfo;
	  }
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_MFA_SELECTION;
			additionalInfo?: AdditionalInfo;
	  }
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED;
			additionalInfo?: AdditionalInfo;
			missingAttributes?: UserAttributeKey[];
	  }
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_SMS_MFA_CODE;
			additionalInfo?: AdditionalInfo;
			codeDeliveryDetails?: AuthCodeDeliveryDetails;
	  }
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_CODE;
			additionalInfo?: AdditionalInfo;
	  }
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_SETUP;
			additionalInfo?: AdditionalInfo;
			secretCode?: string;
	  }
	| {
			signInStep: AuthSignInStep.CONFIRM_SIGN_UP;
	  }
	| {
			signInStep: AuthSignInStep.RESET_PASSWORD;
	  }
	| {
			signInStep: AuthSignInStep.DONE;
	  };

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

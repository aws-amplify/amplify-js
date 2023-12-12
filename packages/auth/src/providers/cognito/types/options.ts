// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthServiceOptions,
	AuthSignUpOptions,
	AuthUserAttributes,
	AuthUserAttributeKey,
} from '../../../types';
import { ClientMetadata, AuthFlowType, ValidationData } from './models';

/**
 * Options specific to Cognito Confirm Reset Password.
 */
export type ConfirmResetPasswordOptions = AuthServiceOptions & {
	clientMetadata?: ClientMetadata;
};

/**
 * Options specific to Cognito Resend Sign Up code.
 */
export type ResendSignUpCodeOptions = AuthServiceOptions & {
	clientMetadata?: ClientMetadata;
};

/**
 * Options specific to Cognito Reset Password.
 */
export type ResetPasswordOptions = AuthServiceOptions & {
	clientMetadata?: ClientMetadata;
};

/**
 * Options specific to Cognito Sign In.
 */
type SignInOptionsBase = AuthServiceOptions & {
	clientMetadata?: ClientMetadata;
};
export type SignInWithCustomAuthOptions = SignInOptionsBase & {
	authFlowType: 'CUSTOM_WITHOUT_SRP';
};

export type SignInWithCustomSRPAuthOptions = SignInOptionsBase & {
	authFlowType: 'CUSTOM_WITH_SRP';
};

export type SignInWithSRPOptions = SignInOptionsBase & {
	authFlowType?: 'USER_SRP_AUTH';
};

export type SignInWithUserPasswordOptions = SignInOptionsBase & {
	authFlowType: 'USER_PASSWORD_AUTH';
};

export type SignInWithOTPOptions = AuthServiceOptions & {
	clientMetadata?: ClientMetadata;
	deliveryMedium: 'SMS' | 'EMAIL';
};

export type SignInWithMagicLinkOptions = AuthServiceOptions & {
	clientMetadata?: ClientMetadata;
	// TODO: need to decide if we want to move it to configuration
	redirectURL: string;
};

/**
 * Options specific to Cognito Sign Up.
 */
export type SignUpOptions<UserAttributeKey extends AuthUserAttributeKey> =
	AuthSignUpOptions<UserAttributeKey> & {
		validationData?: ValidationData;
		clientMetadata?: ClientMetadata;
		autoSignIn?:
			| SignInWithCustomAuthOptions
			| SignInWithCustomSRPAuthOptions
			| SignInWithSRPOptions
			| SignInWithUserPasswordOptions
			| boolean; // default is false;
	};

/**
 * Options specific to Cognito Confirm Sign Up.
 */
export type ConfirmSignUpOptions = AuthServiceOptions & {
	clientMetadata?: ClientMetadata;
	forceAliasCreation?: boolean;
};

/**
 * Options specific to Cognito Confirm Sign In.
 */
export type ConfirmSignInOptions = AuthServiceOptions & {
	userAttributes?: AuthUserAttributes;
	clientMetadata?: ClientMetadata;
	friendlyDeviceName?: string;
};

/**
 * Options specific to Cognito Verify TOTP Setup.
 */
export type VerifyTOTPSetupOptions = AuthServiceOptions & {
	friendlyDeviceName?: string;
};

/**
 * Options specific to Cognito Update User Attributes.
 */
export type UpdateUserAttributesOptions = AuthServiceOptions & {
	clientMetadata?: ClientMetadata;
};

/**
 * Options specific to a Cognito Update User Attributes request.
 */
export type SendUserAttributeVerificationCodeOptions = AuthServiceOptions & {
	clientMetadata?: ClientMetadata;
};

/**
 * Options specific to Cognito Update User Attribute.
 */
export type UpdateUserAttributeOptions = AuthServiceOptions & {
	clientMetadata?: ClientMetadata;
};

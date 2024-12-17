// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthServiceOptions,
	AuthSignUpOptions,
	AuthUserAttributeKey,
	AuthUserAttributes,
} from '../../../types';

import {
	AuthFactorType,
	AuthFlowType,
	ClientMetadata,
	ValidationData,
} from './models';

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
export type SignInOptions = AuthServiceOptions & {
	authFlowType?: AuthFlowType;
	clientMetadata?: ClientMetadata;
	preferredChallenge?: AuthFactorType;
};

/**
 * Options specific to Cognito Sign Up.
 */
export type SignUpOptions<UserAttributeKey extends AuthUserAttributeKey> =
	AuthSignUpOptions<UserAttributeKey> & {
		validationData?: ValidationData;
		clientMetadata?: ClientMetadata;
		autoSignIn?: SignInOptions | boolean; // default is false;
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

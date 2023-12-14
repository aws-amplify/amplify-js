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
export type SignInOptions = {
	authFlowType?: AuthFlowType;
	clientMetadata?: ClientMetadata;
	passwordlessMethod?: never;
};

export type SignInWithEmailOptions<Method extends 'MAGIC_LINK' | 'OTP'> = {
	authFlowType?: never;
	clientMetadata?: ClientMetadata;
	passwordlessMethod: Method;
};

export type SignInWithSMSOptions = {
	authFlowType?: never;
	clientMetadata?: ClientMetadata;
	passwordlessMethod: 'OTP';
};

/**
 * Options specific to Cognito Sign Up.
 */
export type SignUpOptions<UserAttributeKey extends AuthUserAttributeKey> =
	AuthSignUpOptions<UserAttributeKey> & {
		passwordlessMethod?: never;
		validationData?: ValidationData;
		clientMetadata?: ClientMetadata;
		autoSignIn?: SignInOptions | boolean; // default is false;
	};

export type SignUpWithEmailOptions<
	Method extends 'MAGIC_LINK' | 'OTP',
	UserAttributeKey extends AuthUserAttributeKey,
> = {
	userAttributes: Required<AuthUserAttributes<UserAttributeKey>>;
	passwordlessMethod: Method;
	validationData?: ValidationData;
	clientMetadata?: ClientMetadata;
};

export type SignUpWithSMSOptions<
	UserAttributeKey extends AuthUserAttributeKey,
> = {
	userAttributes: Required<AuthUserAttributes<UserAttributeKey>>;
	passwordlessMethod: 'OTP';
	validationData?: ValidationData;
	clientMetadata?: ClientMetadata;
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

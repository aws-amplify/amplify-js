// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ClientMetadata, AuthFlowType, ValidationData } from './models';

/**
 * Options specific to a Cognito Confirm Reset Password request.
 */
export type CognitoConfirmResetPasswordOptions = {
	clientMetadata?: ClientMetadata;
};

/**
 * Options specific to a Cognito Resend Sign Up code request.
 */
export type CognitoResendSignUpCodeOptions = {
	clientMetadata?: ClientMetadata;
};

/**
 * Options specific to a Cognito Reset Password request.
 */
export type CognitoResetPasswordOptions = {
	clientMetadata?: ClientMetadata;
};

/**
 * Options specific to a Cognito Sign In request.
 */
export type CognitoSignInOptions = {
	authFlowType?: AuthFlowType;
	clientMetadata?: ClientMetadata;
};

/**
 * Options specific to a Cognito Sign Up request.
 */
export type CognitoSignUpOptions = {
	validationData?: ValidationData;
	clientMetadata?: ClientMetadata;
	// autoSignIn?: AutoSignInOptions;
};

/**
 * Options specific to a Cognito Confirm Sign Up request.
 */
export type CognitoConfirmSignUpOptions = {
	clientMetadata?: ClientMetadata;
	forceAliasCreation?: boolean;
};

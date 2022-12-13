// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AttributeType, ChallengeNameType, CognitoIdentityProviderClient, SignUpCommand, SignUpCommandInput } from '@aws-sdk/client-cognito-identity-provider';
import { AuthSignInStep, AuthOptions } from '../types';
import { AuthError } from '../Errors';
import { AuthErrorTypes } from '../constants/AuthErrorTypes';

export const createCognitoIdentityProviderClient = (
	config: AuthOptions
): CognitoIdentityProviderClient => {
	return new CognitoIdentityProviderClient({region: config.region}); // TODO add other options to constructor
}

export const mapChallengeNames = (challengeNameType: string): AuthSignInStep => {
	switch(challengeNameType) {
		// case ChallengeNameType.ADMIN_NO_SRP_AUTH:
		case ChallengeNameType.CUSTOM_CHALLENGE:
			return AuthSignInStep.CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE;
		// case ChallengeNameType.DEVICE_PASSWORD_VERIFIER:
		// case ChallengeNameType.DEVICE_SRP_AUTH:
		// case ChallengeNameType.MFA_SETUP:
		case ChallengeNameType.NEW_PASSWORD_REQUIRED:
			return AuthSignInStep.CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED;
		// case ChallengeNameType.PASSWORD_VERIFIER:
		case ChallengeNameType.SELECT_MFA_TYPE:
			return AuthSignInStep.SELECT_MFA_TYPE;
		case ChallengeNameType.SMS_MFA:
			return AuthSignInStep.CONFIRM_SIGN_IN_WITH_SMS_MFA_CODE;
		case ChallengeNameType.SOFTWARE_TOKEN_MFA:
			return AuthSignInStep.CONFIRM_SIGN_IN_WITH_SOFTWARE_TOKEN_MFA_CODE;
		default:
			return AuthSignInStep.DONE;
	}
}

export const getUserPoolId = (config: AuthOptions) => {
	if (!config.userPoolId) {
		throw new AuthError(AuthErrorTypes.NoConfig); // TODO change when AuthErrors are defined
	} 
	return config.userPoolId;
}

export const createSignUpCommand = (
	clientId: string, 
	username: string, 
	password: string,
	userAttributes?: AttributeType[],
	validationData?: AttributeType[],
	clientMetadata?: Record<string, string>
): SignUpCommand => {
	const signUpCommandInput: SignUpCommandInput = {
		ClientId: clientId,
		Username: username,
		Password: password
	};
	if (userAttributes) {
		signUpCommandInput.UserAttributes = userAttributes;
	}
	if (validationData) {
		signUpCommandInput.ValidationData = validationData;
	}
	if (clientMetadata) {
		signUpCommandInput.ClientMetadata = clientMetadata;
	}
	return new SignUpCommand(signUpCommandInput);
}

export const sendCommand = async (client:CognitoIdentityProviderClient, command) => {
	try {
		return await client.send(command);
	} catch (error) {
		throw error; // TODO change when AuthErrors are defined
	}
}

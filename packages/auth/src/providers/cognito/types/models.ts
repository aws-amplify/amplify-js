// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthStandardAttributeKey } from '../../../types';
import { AuthProvider } from '../../../types/inputs';

/**
 * Cognito supported AuthFlowTypes that may be passed as part of the Sign In request.
 */
export type AuthFlowType =
	| 'USER_SRP_AUTH'
	| 'CUSTOM_WITH_SRP'
	| 'CUSTOM_WITHOUT_SRP'
	| 'USER_PASSWORD_AUTH';

export const cognitoHostedUIIdentityProviderMap: Record<AuthProvider, string> =
	{
		Google: 'Google',
		Facebook: 'Facebook',
		Amazon: 'LoginWithAmazon',
		Apple: 'SignInWithApple',
	};

/**
 * Arbitrary key/value pairs that may be passed as part of certain Cognito requests
 */
export type ClientMetadata = {
	[key: string]: string;
};

/**
 * The user attribute types available for Cognito.
 */
export type UserAttributeKey = AuthStandardAttributeKey | CustomAttribute;

/**
 * Cognito custom attribute type
 */
// TODO(V6): replace by `custom:${string}` once categories that use auth have upgraded TS
export type CustomAttribute = string & {};

/**
 * One or more name-value pairs containing the validation data in the request to register a user.
 */
export type ValidationData = { [key: string]: string };

/**
 * Cognito supported MFAPreference values that may be passed as part of the UpdateMFAPreferenceRequest.
 */
export type MFAPreference =
	| 'ENABLED'
	| 'DISABLED'
	| 'PREFERRED'
	| 'NOT_PREFERRED';

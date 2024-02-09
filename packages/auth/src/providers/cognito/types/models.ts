// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthStandardAttributeKey,
	AuthVerifiableAttributeKey,
} from '@aws-amplify/core/internals/utils';

import {
	AuthUserAttribute,
	AuthDevice,
	AWSAuthUser,
	AuthCodeDeliveryDetails,
} from '../../../types';

import { AuthProvider } from '../../../types/inputs';
import { SignUpOutput } from './outputs';

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
 * Verifiable user attribute types available for Cognito.
 */
export type VerifiableUserAttributeKey = AuthVerifiableAttributeKey;

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

export type AutoSignInEventData =
	| {
			event: 'confirmSignUp';
			data: SignUpOutput;
	  }
	| {
			event: 'autoSignIn';
	  };
/**
 * Holds the device specific information along with it's id and name.
 */
export type AWSAuthDevice = AuthDevice & {
	attributes: AuthUserAttribute<UserAttributeKey>;
	createDate?: Date;
	lastAuthenticatedDate?: Date;
	lastModifiedDate?: Date;
};

/**
 * Holds the sign in details of the user.
 */
export type CognitoAuthSignInDetails = {
	loginId?: string;
	authFlowType?: AuthFlowType;
};

/**
 * Holds the user information along with the sign in details.
 */
export interface AuthUser extends AWSAuthUser {
	signInDetails?: CognitoAuthSignInDetails;
}

/**
 * Holds data describing the dispatch of a confirmation code.
 */
export type CodeDeliveryDetails<
	CognitoUserAttributeKey extends UserAttributeKey = UserAttributeKey,
> = AuthCodeDeliveryDetails<CognitoUserAttributeKey>;

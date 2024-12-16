// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { UpdateMFAPreferenceInput } from '../types';
import { SetUserMFAPreferenceException } from '../types/errors';
import { MFAPreference } from '../types/models';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { CognitoMFASettings } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { assertAuthTokens } from '../utils/types';
import { getAuthUserAgentValue } from '../../../utils';
import { createSetUserMFAPreferenceClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';

/**
 * Updates the MFA preference of the user.
 *
 * @param input - The UpdateMFAPreferenceInput object.
 * @throws -{@link SetUserMFAPreferenceException } - Service error thrown when the MFA preference cannot be updated.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function updateMFAPreference(
	input: UpdateMFAPreferenceInput,
): Promise<void> {
	const { sms, totp, email } = input;
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolEndpoint, userPoolId } = authConfig;
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	const setUserMFAPreference = createSetUserMFAPreferenceClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});
	await setUserMFAPreference(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.UpdateMFAPreference),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			SMSMfaSettings: getMFASettings(sms),
			SoftwareTokenMfaSettings: getMFASettings(totp),
			EmailMfaSettings: getMFASettings(email),
		},
	);
}

export function getMFASettings(
	mfaPreference?: MFAPreference,
): CognitoMFASettings | undefined {
	if (mfaPreference === 'DISABLED') {
		return {
			Enabled: false,
		};
	} else if (mfaPreference === 'PREFERRED') {
		return {
			Enabled: true,
			PreferredMfa: true,
		};
	} else if (mfaPreference === 'ENABLED') {
		return {
			Enabled: true,
		};
	} else if (mfaPreference === 'NOT_PREFERRED') {
		return {
			Enabled: true,
			PreferredMfa: false,
		};
	}
}

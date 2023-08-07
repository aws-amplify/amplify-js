// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { UpdateMFAPreferenceRequest } from '../types';
import { SetUserMFAPreferenceException } from '../types/errors';
import { MFAPreference } from '../types/models';
import { setUserMFAPreference } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { CognitoMFASettings } from '../utils/clients/CognitoIdentityProvider/types';

/**
 * Updates the MFA preference of the user.
 *
 * @param updateMFAPreferenceRequest - The request object to update MFA preference.
 *
 * @throws -{@link SetUserMFAPreferenceException } - Service error thrown when the MFA preference cannot be updated.
 *
 *
 * TODO: add config errors
 */
export async function updateMFAPreference(
	updateMFAPreferenceRequest: UpdateMFAPreferenceRequest
): Promise<void> {
	const { sms, totp } = updateMFAPreferenceRequest;
	const { userPoolId } = AmplifyV6.getConfig().Auth;
	const mockedAccessToken = 'mockedAccessToken';
	await setUserMFAPreference(
		{ region: getRegion(userPoolId) },
		{
			AccessToken: mockedAccessToken,
			SMSMfaSettings: getMFASettings(sms),
			SoftwareTokenMfaSettings: getMFASettings(totp),
		}
	);
}

export function getMFASettings(
	mfaPreference?: MFAPreference
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

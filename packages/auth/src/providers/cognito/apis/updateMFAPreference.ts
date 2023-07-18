// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { UpdateMFAPreferenceRequest } from '../types';
import { SetUserMFAPreferenceException } from '../types/errors';
import { MFAPreference } from '../types/models';
import { setUserMFAPreferenceClient } from '../utils/clients/SetUserMFAPreferenceClient';
import { CognitoMFASettings } from '../utils/clients/types/models';

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

	const mockedAccessToken = 'mockedAccessToken';
	await setUserMFAPreferenceClient({
		AccessToken: mockedAccessToken,
		SMSMfaSettings: getMFASettings(sms),
		SoftwareTokenMfaSettings: getMFASettings(totp),
	});
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

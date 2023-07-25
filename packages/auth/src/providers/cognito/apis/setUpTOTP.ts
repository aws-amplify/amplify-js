// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../errors/AuthError';
import { TOTPSetupDetails } from '../../../types/models';
import { SETUP_TOTP_EXCEPTION,  AssociateSoftwareTokenException } from '../types/errors';
import { associateSoftwareTokenClient } from '../utils/clients/AssociateSoftwareTokenClient';
import { getTOTPSetupDetails } from '../utils/signInHelpers';

/**
 * Sets up TOTP for the user.
 *
 * @throws -{@link AssociateSoftwareTokenException} 
 * Thrown if a service occurs while setting up TOTP.
 *
 * @returns TOTPSetupDetails
 *
 **/
export async function setUpTOTP(): Promise<TOTPSetupDetails> {
	// TODO: delete this mock when auth token provider is implemented.
	const accessToken = 'mockedAccessToken';
	// TODO: extract username from auth token provider.
	const username = 'mockedUsername';
	const { SecretCode } = await associateSoftwareTokenClient({
		AccessToken: accessToken,
	});

	if (!SecretCode) {
		// This should never happen.
		throw new AuthError({
			name: SETUP_TOTP_EXCEPTION,
			message: 'Failed to set up TOTP.',
		});
	}
	return getTOTPSetupDetails(SecretCode, username);
}

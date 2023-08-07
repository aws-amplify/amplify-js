// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { AuthError } from '../../../errors/AuthError';
import { TOTPSetupDetails } from '../../../types/models';
import {
	SETUP_TOTP_EXCEPTION,
	AssociateSoftwareTokenException,
} from '../types/errors';
import { getTOTPSetupDetails } from '../utils/signInHelpers';
import { associateSoftwareToken } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';

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
	const accessToken =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
	// TODO: extract username from auth token provider.
	const username = 'mockedUsername';
	const { userPoolId } = AmplifyV6.getConfig().Auth;
	const { SecretCode } = await associateSoftwareToken(
		{ region: getRegion(userPoolId) },
		{
			AccessToken: accessToken,
		}
	);

	if (!SecretCode) {
		// This should never happen.
		throw new AuthError({
			name: SETUP_TOTP_EXCEPTION,
			message: 'Failed to set up TOTP.',
		});
	}
	return getTOTPSetupDetails(SecretCode, username);
}

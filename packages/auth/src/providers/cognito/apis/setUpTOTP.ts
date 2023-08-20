// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 as Amplify } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/library-utils';
import { fetchAuthSession } from '../../../';
import { AuthError } from '../../../errors/AuthError';
import { TOTPSetupDetails } from '../../../types/models';
import {
	SETUP_TOTP_EXCEPTION,
	AssociateSoftwareTokenException,
} from '../types/errors';
import { getTOTPSetupDetails } from '../utils/signInHelpers';
import { associateSoftwareToken } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokens } from '../utils/types';

/**
 * Sets up TOTP for the user.
 *
 * @throws -{@link AssociateSoftwareTokenException}
 * Thrown if a service occurs while setting up TOTP.
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 *
 * @returns TOTPSetupDetails
 *
 **/
export async function setUpTOTP(): Promise<TOTPSetupDetails> {
	const authConfig = Amplify.getConfig().Auth;
	assertTokenProviderConfig(authConfig);
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	const username = tokens.idToken?.payload['cognito:username'] ?? '';
	const { SecretCode } = await associateSoftwareToken(
		{ region: getRegion(authConfig.userPoolId) },
		{
			AccessToken: tokens.accessToken.toString(),
		}
	);

	if (!SecretCode) {
		// This should never happen.
		throw new AuthError({
			name: SETUP_TOTP_EXCEPTION,
			message: 'Failed to set up TOTP.',
		});
	}
	return getTOTPSetupDetails(SecretCode, JSON.stringify(username));
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { VerifyTOTPSetupRequest } from '../../../types/requests';
import { CogntioVerifyTOTPSetupOptions } from '../types/options';
import { verifySoftwareToken } from '../utils/clients/CognitoIdentityProvider';
import { VerifySoftwareTokenException } from '../types/errors';
import { AmplifyV6 } from '@aws-amplify/core';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';

/**
 * Verifies an OTP code retrieved from an associated authentication app.
 *
 * @param verifyTOTPSetupRequest - The VerifyTOTPSetupRequest
 *
 * @throws  -{@link VerifySoftwareTokenException }:
 * Thrown due to an invalid MFA token.
 *
 * @throws  -{@link AuthValidationErrorCode }:
 * Thrown when `code` is not defined.
 *
 * TODO: add config errors
 *
 */
export async function verifyTOTPSetup(
	verifyTOTPSetupRequest: VerifyTOTPSetupRequest<CogntioVerifyTOTPSetupOptions>
): Promise<void> {
	// TODO: remove mocked when auth token provider is implemented.
	const accessToken = 'mockAccessToken';
	const { userPoolId } = AmplifyV6.getConfig().Auth;
	const { code, options } = verifyTOTPSetupRequest;
	assertValidationError(
		!!code,
		AuthValidationErrorCode.EmptyVerifyTOTPSetupCode
	);

	await verifySoftwareToken(
		{ region: getRegion(userPoolId) },
		{
			AccessToken: accessToken,
			UserCode: code,
			FriendlyDeviceName: options?.serviceOptions?.friendlyDeviceName,
		}
	);
}

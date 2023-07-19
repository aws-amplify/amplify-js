// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { VerifyTOTPSetupRequest } from '../../../types/requests';
import { CogntioVerifyTOTPSetupOptions } from '../types/options';
import { verifySoftwareTokenClient } from '../utils/clients/VerifySoftwareTokenClient';
import { VerifySoftwareTokenException } from '../types/errors';

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
	const { code, options } = verifyTOTPSetupRequest;
	assertValidationError(
		!!code,
		AuthValidationErrorCode.EmptyVerifyTOTPSetupCode
	);

	await verifySoftwareTokenClient({
		AccessToken: accessToken,
		UserCode: code,
		FriendlyDeviceName: options?.serviceOptions?.friendlyDeviceName,
	});
}

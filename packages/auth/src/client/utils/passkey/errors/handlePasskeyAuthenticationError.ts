// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { handlePasskeyError } from './handlePasskeyError';
import {
	PasskeyError,
	PasskeyErrorCode,
	passkeyErrorMap,
} from './passkeyError';

/**
 * Handle Passkey Authentication Errors
 * https://w3c.github.io/webauthn/#sctn-get-request-exceptions
 *
 * @param err unknown
 * @returns PasskeyError
 */
export const handlePasskeyAuthenticationError = (
	err: unknown,
): PasskeyError => {
	if (err instanceof PasskeyError) {
		return err;
	}

	if (err instanceof Error) {
		if (err.name === 'NotAllowedError') {
			const { message, recoverySuggestion } =
				passkeyErrorMap[PasskeyErrorCode.PasskeyAuthenticationCanceled];

			return new PasskeyError({
				name: PasskeyErrorCode.PasskeyAuthenticationCanceled,
				message,
				recoverySuggestion,
				underlyingError: err,
			});
		}
	}

	return handlePasskeyError(err);
};

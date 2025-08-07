// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { handlePasskeyError } from './handlePasskeyError';
import {
	PasskeyError,
	PasskeyErrorCode,
	passkeyErrorMap,
} from './passkeyError';

/**
 * Handle Passkey Registration Errors
 * https://w3c.github.io/webauthn/#sctn-create-request-exceptions
 *
 * @param err unknown
 * @returns PasskeyError
 */
export const handlePasskeyRegistrationError = (err: unknown): PasskeyError => {
	if (err instanceof PasskeyError) {
		return err;
	}

	if (err instanceof Error) {
		// Duplicate Passkey
		if (err.name === 'InvalidStateError') {
			const { message, recoverySuggestion } =
				passkeyErrorMap[PasskeyErrorCode.PasskeyAlreadyExists];

			return new PasskeyError({
				name: PasskeyErrorCode.PasskeyAlreadyExists,
				message,
				recoverySuggestion,
				underlyingError: err,
			});
		}

		// User Cancels Ceremony / Generic Catch All
		if (err.name === 'NotAllowedError') {
			const { message, recoverySuggestion } =
				passkeyErrorMap[PasskeyErrorCode.PasskeyRegistrationCanceled];

			return new PasskeyError({
				name: PasskeyErrorCode.PasskeyRegistrationCanceled,
				message,
				recoverySuggestion,
				underlyingError: err,
			});
		}
	}

	return handlePasskeyError(err);
};

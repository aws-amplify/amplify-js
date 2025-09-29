// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorCode } from '@aws-amplify/core/internals/utils';

import {
	PasskeyError,
	PasskeyErrorCode,
	passkeyErrorMap,
} from './passkeyError';

/**
 * Handles Overlapping Passkey Errors Between Registration & Authentication
 * https://w3c.github.io/webauthn/#sctn-create-request-exceptions
 * https://w3c.github.io/webauthn/#sctn-get-request-exceptions
 *
 * @param err unknown
 * @returns PasskeyError
 */
export const handlePasskeyError = (err: unknown): PasskeyError => {
	if (err instanceof Error) {
		// Passkey Operation Aborted
		if (err.name === 'AbortError') {
			const { message, recoverySuggestion } =
				passkeyErrorMap[PasskeyErrorCode.PasskeyOperationAborted];

			return new PasskeyError({
				name: PasskeyErrorCode.PasskeyOperationAborted,
				message,
				recoverySuggestion,
				underlyingError: err,
			});
		}
		// Relying Party / Domain Mismatch
		if (err.name === 'SecurityError') {
			const { message, recoverySuggestion } =
				passkeyErrorMap[PasskeyErrorCode.RelyingPartyMismatch];

			return new PasskeyError({
				name: PasskeyErrorCode.RelyingPartyMismatch,
				message,
				recoverySuggestion,
				underlyingError: err,
			});
		}
	}

	return new PasskeyError({
		name: AmplifyErrorCode.Unknown,
		message: 'An unknown error has occurred.',
		underlyingError: err,
	});
};

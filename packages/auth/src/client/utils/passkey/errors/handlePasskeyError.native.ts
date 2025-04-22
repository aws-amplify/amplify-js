// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorCode } from '@aws-amplify/core/internals/utils';
import { getIsNativeError } from '@aws-amplify/react-native';

import {
	PasskeyError,
	PasskeyErrorCode,
	passkeyErrorMap,
} from './passkeyError';

/**
 * Handles Overlapping Passkey Errors Between Registration & Authentication
 *
 * @param err unknown
 * @returns PasskeyError
 */
export const handlePasskeyError = (err: unknown): PasskeyError => {
	if (getIsNativeError(err)) {
		// Passkey Operation Aborted
		if (err.code === 'FAILED') {
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
		if (err.code === 'RELYING_PARTY_MISMATCH') {
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

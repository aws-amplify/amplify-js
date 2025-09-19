// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getIsNativeError } from '@aws-amplify/react-native';

import { handlePasskeyError } from './handlePasskeyError';
import {
	PasskeyError,
	PasskeyErrorCode,
	passkeyErrorMap,
} from './passkeyError';

/**
 * Handle Passkey Authentication Errors
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

	if (getIsNativeError(err)) {
		// Passkey Retrieval Failed
		if (err.code === 'FAILED') {
			const { message, recoverySuggestion } =
				passkeyErrorMap[PasskeyErrorCode.PasskeyRetrievalFailed];

			return new PasskeyError({
				name: PasskeyErrorCode.PasskeyRetrievalFailed,
				message,
				recoverySuggestion,
				underlyingError: err,
			});
		}

		if (err.code === 'CANCELED') {
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

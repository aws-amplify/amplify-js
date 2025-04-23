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
 * Handle Passkey Registration Errors
 *
 * @param err unknown
 * @returns PasskeyError
 */
export const handlePasskeyRegistrationError = (err: unknown): PasskeyError => {
	if (err instanceof PasskeyError) {
		return err;
	}

	if (getIsNativeError(err)) {
		// Passkey Registration Failed
		if (err.code === 'FAILED') {
			const { message, recoverySuggestion } =
				passkeyErrorMap[PasskeyErrorCode.PasskeyRegistrationFailed];

			return new PasskeyError({
				name: PasskeyErrorCode.PasskeyRegistrationFailed,
				message,
				recoverySuggestion,
				underlyingError: err,
			});
		}

		// Duplicate Passkey
		if (err.code === 'DUPLICATE') {
			const { message, recoverySuggestion } =
				passkeyErrorMap[PasskeyErrorCode.PasskeyAlreadyExists];

			return new PasskeyError({
				name: PasskeyErrorCode.PasskeyAlreadyExists,
				message,
				recoverySuggestion,
				underlyingError: err,
			});
		}

		// User Cancels Ceremony
		if (err.code === 'CANCELED') {
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

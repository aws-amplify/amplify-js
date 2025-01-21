// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorCode } from '@aws-amplify/core/internals/utils';

import { PasskeyError, PasskeyErrorCode, passkeyErrorMap } from './shared';

/**
 * Handles Overlapping Passkey Errors Between Registration & Authentication
 */
const handlePasskeyError = (err: unknown): PasskeyError => {
	if (err instanceof Error) {
		if (err.name === 'AbortError') {
			return new PasskeyError({
				name: PasskeyErrorCode.PasskeyOperationAborted,
				...passkeyErrorMap[PasskeyErrorCode.PasskeyOperationAborted],
				underlyingError: err,
			});
		}
		if (err.name === 'SecurityError') {
			return new PasskeyError({
				name: PasskeyErrorCode.RelyingPartyMismatch,
				...passkeyErrorMap[PasskeyErrorCode.RelyingPartyMismatch],
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

export const handlePasskeyAuthenticationError = (
	err: unknown,
): PasskeyError => {
	if (err instanceof PasskeyError) {
		return err;
	}

	if (err instanceof Error && err.name === 'NotAllowedError') {
		return new PasskeyError({
			name: PasskeyErrorCode.PasskeyAuthenticationCanceled,
			...passkeyErrorMap[PasskeyErrorCode.PasskeyAuthenticationCanceled],
			underlyingError: err,
		});
	}

	return handlePasskeyError(err);
};

export const handlePasskeyRegistrationError = (err: unknown): PasskeyError => {
	if (err instanceof PasskeyError) {
		return err;
	}

	if (err instanceof Error) {
		if (err.name === 'InvalidStateError') {
			return new PasskeyError({
				name: PasskeyErrorCode.PasskeyAlreadyExists,
				...passkeyErrorMap[PasskeyErrorCode.PasskeyAlreadyExists],
				underlyingError: err,
			});
		}

		if (err.name === 'NotAllowedError') {
			return new PasskeyError({
				name: PasskeyErrorCode.PasskeyRegistrationCanceled,
				...passkeyErrorMap[PasskeyErrorCode.PasskeyRegistrationCanceled],
				underlyingError: err,
			});
		}
	}

	return handlePasskeyError(err);
};

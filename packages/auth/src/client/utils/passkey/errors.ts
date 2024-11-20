// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyError,
	AmplifyErrorCode,
	AmplifyErrorMap,
	AmplifyErrorParams,
	AssertionFunction,
	createAssertionFunction,
} from '@aws-amplify/core/internals/utils';

export class PasskeyError extends AmplifyError {
	constructor(params: AmplifyErrorParams) {
		super(params);

		// Hack for making the custom error class work when transpiled to es5
		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = PasskeyError;
		Object.setPrototypeOf(this, PasskeyError.prototype);
	}
}

export enum PasskeyErrorCode {
	// not supported
	PasskeyNotSupported = 'PasskeyNotSupported',
	// duplicate passkey
	PasskeyAlreadyExists = 'PasskeyAlreadyExists',
	// misconfigurations
	InvalidPasskeyRegistrationOptions = 'InvalidPasskeyRegistrationOptions',
	InvalidPasskeyAuthenticationOptions = 'InvalidPasskeyAuthenticationOptions',
	RelyingPartyMismatch = 'RelyingPartyMismatch',
	// failed credential creation / retrieval
	PasskeyRegistrationFailed = 'PasskeyRegistrationFailed',
	PasskeyRetrievalFailed = 'PasskeyRetrievalFailed',
	// cancel / aborts
	PasskeyRegistrationCanceled = 'PasskeyRegistrationCanceled',
	PasskeyAuthenticationCanceled = 'PasskeyAuthenticationCanceled',
	PasskeyOperationAborted = 'PasskeyOperationAborted',
}

const notSupportedRecoverySuggestion =
	'Passkeys may not be supported on this device. Ensure your application is running in a secure context (HTTPS) and Web Authentication API is supported.';
const abortOrCancelRecoverySuggestion =
	'User may have canceled the ceremony or another interruption has occurred. Check underlying error for details.';
const misconfigurationRecoverySuggestion =
	'Ensure your user pool is configured to support the WEB_AUTHN as an authentication factor.';

const passkeyErrorMap: AmplifyErrorMap<PasskeyErrorCode> = {
	[PasskeyErrorCode.PasskeyNotSupported]: {
		message: 'Passkeys may not be supported on this device.',
		recoverySuggestion: notSupportedRecoverySuggestion,
	},
	[PasskeyErrorCode.InvalidPasskeyRegistrationOptions]: {
		message: 'Invalid passkey registration options.',
		recoverySuggestion: misconfigurationRecoverySuggestion,
	},
	[PasskeyErrorCode.InvalidPasskeyAuthenticationOptions]: {
		message: 'Invalid passkey authentication options.',
		recoverySuggestion: misconfigurationRecoverySuggestion,
	},
	[PasskeyErrorCode.PasskeyRegistrationFailed]: {
		message: 'Device failed to create passkey.',
		recoverySuggestion: notSupportedRecoverySuggestion,
	},
	[PasskeyErrorCode.PasskeyRetrievalFailed]: {
		message: 'Device failed to retrieve passkey.',
		recoverySuggestion:
			'Passkeys may not be available on this device. Try an alternative authentication factor like PASSWORD, EMAIL_OTP, or SMS_OTP.',
	},
	[PasskeyErrorCode.PasskeyAlreadyExists]: {
		message: 'Passkey already exists in authenticator.',
		recoverySuggestion:
			'Proceed with existing passkey or try again after deleting the credential.',
	},
	[PasskeyErrorCode.PasskeyRegistrationCanceled]: {
		message: 'Passkey registration ceremony has been canceled.',
		recoverySuggestion: abortOrCancelRecoverySuggestion,
	},
	[PasskeyErrorCode.PasskeyAuthenticationCanceled]: {
		message: 'Passkey authentication ceremony has been canceled.',
		recoverySuggestion: abortOrCancelRecoverySuggestion,
	},
	[PasskeyErrorCode.PasskeyOperationAborted]: {
		message: 'Passkey operation has been aborted.',
		recoverySuggestion: abortOrCancelRecoverySuggestion,
	},
	[PasskeyErrorCode.RelyingPartyMismatch]: {
		message: 'Relying party does not match current domain.',
		recoverySuggestion:
			'Ensure relying party identifier matches current domain.',
	},
};

export const assertPasskeyError: AssertionFunction<PasskeyErrorCode> =
	createAssertionFunction(passkeyErrorMap, PasskeyError);

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

/**
 * Handles Overlapping Passkey Errors Between Registration & Authentication
 * https://w3c.github.io/webauthn/#sctn-create-request-exceptions
 * https://w3c.github.io/webauthn/#sctn-get-request-exceptions
 *
 * @param err unknown
 * @returns PasskeyError
 */
const handlePasskeyError = (err: unknown): PasskeyError => {
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

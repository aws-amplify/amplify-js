import { AmplifyErrorCode } from '@aws-amplify/core/internals/utils';

import { PasskeyError, PasskeyErrorCode, passkeyErrorMap } from './shared';

/**
 * Handle Passkey Authentication Errors for Native Platforms
 * Maps native error codes to PasskeyError types
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

	if (err instanceof Error && 'code' in err) {
		switch (err.code) {
			case 'UserCancelled':
				return new PasskeyError({
					name: PasskeyErrorCode.PasskeyAuthenticationCanceled,
					...passkeyErrorMap[PasskeyErrorCode.PasskeyAuthenticationCanceled],
					underlyingError: err,
				});
			case 'NotSupported':
				return new PasskeyError({
					name: PasskeyErrorCode.PasskeyNotSupported,
					...passkeyErrorMap[PasskeyErrorCode.PasskeyNotSupported],
					underlyingError: err,
				});
			case 'NotConfigured':
				return new PasskeyError({
					name: PasskeyErrorCode.InvalidPasskeyAuthenticationOptions,
					...passkeyErrorMap[
						PasskeyErrorCode.InvalidPasskeyAuthenticationOptions
					],
					underlyingError: err,
				});
			case 'NoCredentials':
				return new PasskeyError({
					name: PasskeyErrorCode.PasskeyRetrievalFailed,
					...passkeyErrorMap[PasskeyErrorCode.PasskeyRetrievalFailed],
					underlyingError: err,
				});
			case 'Interrupted':
				return new PasskeyError({
					name: PasskeyErrorCode.PasskeyOperationAborted,
					...passkeyErrorMap[PasskeyErrorCode.PasskeyOperationAborted],
					underlyingError: err,
				});
		}
	}

	return new PasskeyError({
		name: AmplifyErrorCode.Unknown,
		message: 'An unknown error occurred during passkey authentication.',
		underlyingError: err,
	});
};

/**
 * Handle Passkey Registration Errors for Native Platforms
 * Maps native error codes to PasskeyError types
 *
 * @param err unknown
 * @returns PasskeyError
 */
export const handlePasskeyRegistrationError = (err: unknown): PasskeyError => {
	if (err instanceof PasskeyError) {
		return err;
	}

	if (err instanceof Error && 'code' in err) {
		switch (err.code) {
			case 'UserCancelled':
				return new PasskeyError({
					name: PasskeyErrorCode.PasskeyRegistrationCanceled,
					...passkeyErrorMap[PasskeyErrorCode.PasskeyRegistrationCanceled],
					underlyingError: err,
				});
			case 'NotSupported':
				return new PasskeyError({
					name: PasskeyErrorCode.PasskeyNotSupported,
					...passkeyErrorMap[PasskeyErrorCode.PasskeyNotSupported],
					underlyingError: err,
				});
			case 'NotConfigured':
				return new PasskeyError({
					name: PasskeyErrorCode.InvalidPasskeyRegistrationOptions,
					...passkeyErrorMap[
						PasskeyErrorCode.InvalidPasskeyRegistrationOptions
					],
					underlyingError: err,
				});
			case 'Interrupted':
				return new PasskeyError({
					name: PasskeyErrorCode.PasskeyOperationAborted,
					...passkeyErrorMap[PasskeyErrorCode.PasskeyOperationAborted],
					underlyingError: err,
				});
		}
	}

	return new PasskeyError({
		name: AmplifyErrorCode.Unknown,
		message: 'An unknown error occurred during passkey registration.',
		underlyingError: err,
	});
};

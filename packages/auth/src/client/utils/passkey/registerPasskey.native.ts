// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';
import { createPasskey as rtnCreatePasskey } from '@aws-amplify/react-native';

import { PasskeyError, PasskeyErrorCode } from './errors';
import { PasskeyCreateOptionsJson, PasskeyCreateResultJson } from './types';

/**
 * Registers a new passkey credential on the device
 * @param input - Options for creating the passkey
 * @returns Promise<PasskeyCreateResultJson>
 * @throws PasskeyError for validation, registration, or parsing failures
 */
export const registerPasskey = async (
	input: PasskeyCreateOptionsJson,
): Promise<PasskeyCreateResultJson> => {
	// Validate required input fields
	if (!input?.rp?.name) {
		throw new PasskeyError({
			name: PasskeyErrorCode.InvalidPasskeyRegistrationOptions,
			message: 'Missing required relying party name',
			recoverySuggestion:
				'Ensure the relying party name is provided in the options',
		});
	}

	if (!input?.user?.id || !input?.user?.name || !input?.user?.displayName) {
		throw new PasskeyError({
			name: PasskeyErrorCode.InvalidPasskeyRegistrationOptions,
			message: 'Missing required user information',
			recoverySuggestion: 'Ensure user id, name, and displayName are provided',
		});
	}

	if (!input?.challenge) {
		throw new PasskeyError({
			name: PasskeyErrorCode.InvalidPasskeyRegistrationOptions,
			message: 'Missing required challenge',
			recoverySuggestion: 'Ensure the challenge parameter is provided',
		});
	}

	if (
		!Array.isArray(input?.pubKeyCredParams) ||
		input.pubKeyCredParams.length === 0
	) {
		throw new PasskeyError({
			name: PasskeyErrorCode.InvalidPasskeyRegistrationOptions,
			message: 'Invalid or missing public key credential parameters',
			recoverySuggestion:
				'Ensure valid public key credential parameters are provided',
		});
	}

	try {
		// Convert input to JSON string
		const requestJson = JSON.stringify(input);

		// Call native module
		const result = await rtnCreatePasskey(requestJson);

		// Validate response exists
		if (!result) {
			throw new PasskeyError({
				name: PasskeyErrorCode.PasskeyRegistrationFailed,
				message: 'No response received from native module',
				recoverySuggestion: 'Try the registration again',
			});
		}

		try {
			// Parse and validate response
			const parsedResult = JSON.parse(result) as PasskeyCreateResultJson;

			// Validate response structure
			if (
				!parsedResult.id ||
				!parsedResult.rawId ||
				!parsedResult.response ||
				!parsedResult.type
			) {
				throw new PasskeyError({
					name: PasskeyErrorCode.PasskeyRegistrationFailed,
					message: 'Invalid response format from native module',
					recoverySuggestion: 'Ensure the device supports passkey registration',
				});
			}

			// Validate response type
			if (parsedResult.type !== 'public-key') {
				throw new PasskeyError({
					name: PasskeyErrorCode.PasskeyRegistrationFailed,
					message: 'Invalid credential type in response',
					recoverySuggestion: 'Ensure the device supports WebAuthn credentials',
				});
			}

			// Validate attestation response
			if (
				!parsedResult.response.attestationObject ||
				!parsedResult.response.clientDataJSON
			) {
				throw new PasskeyError({
					name: PasskeyErrorCode.PasskeyRegistrationFailed,
					message: 'Missing required attestation data in response',
					recoverySuggestion:
						'Try registering again or check device compatibility',
				});
			}

			return parsedResult;
		} catch (parseError) {
			if (parseError instanceof PasskeyError) {
				throw parseError;
			}
			throw new PasskeyError({
				name: PasskeyErrorCode.PasskeyRegistrationFailed,
				message: 'Failed to parse native module response',
				recoverySuggestion: 'Try the registration again',
				underlyingError: parseError,
			});
		}
	} catch (error) {
		// Handle native module specific errors
		if (error instanceof Error && 'code' in error) {
			switch (error.code) {
				case 'UserCancelled':
					throw new PasskeyError({
						name: PasskeyErrorCode.PasskeyRegistrationCanceled,
						message: 'User cancelled the registration',
						recoverySuggestion: 'The user can try registering again',
					});
				case 'NotSupported':
					throw new PasskeyError({
						name: PasskeyErrorCode.PasskeyNotSupported,
						message: 'Passkeys are not supported on this device',
						recoverySuggestion:
							'Try using a device that supports passkey registration',
					});
				case 'NotConfigured':
					throw new PasskeyError({
						name: PasskeyErrorCode.InvalidPasskeyRegistrationOptions,
						message: 'Passkey registration is not properly configured',
						recoverySuggestion: 'Check your passkey configuration',
					});
				case 'Interrupted':
					throw new PasskeyError({
						name: PasskeyErrorCode.PasskeyOperationAborted,
						message: 'Registration was interrupted',
						recoverySuggestion:
							'Try registering again when the device is not in use',
					});
			}
		}

		// If it's already a PasskeyError, rethrow it
		if (error instanceof PasskeyError) {
			throw error;
		}

		// Handle any other errors
		throw new PasskeyError({
			name: PasskeyErrorCode.PasskeyRegistrationFailed,
			message: 'Failed to register passkey',
			recoverySuggestion:
				'Try the registration again or check device compatibility',
			underlyingError: error,
		});
	}
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// import { PlatformNotSupportedError } from '@aws-amplify/core/internals/utils';
import { getPasskey as rtnGetPasskey } from '@aws-amplify/react-native';

import { PasskeyError, PasskeyErrorCode } from './errors';
import { PasskeyGetOptionsJson, PasskeyGetResultJson } from './types';

/**
 * Retrieves a stored passkey credential from the device
 * @param input - Options for retrieving the passkey
 * @returns Promise<PasskeyGetResultJson>
 * @throws PasskeyError
 */
export const getPasskey = async (
	input: PasskeyGetOptionsJson,
): Promise<PasskeyGetResultJson> => {
	// Input validation
	if (!input?.challenge) {
		throw new PasskeyError({
			name: PasskeyErrorCode.InvalidPasskeyAuthenticationOptions,
			message: 'Missing required challenge in input',
			recoverySuggestion:
				'Ensure the challenge parameter is provided in the options',
		});
	}

	try {
		// Convert input to JSON string
		const requestJson = JSON.stringify(input);

		// Call native module
		const result = await rtnGetPasskey(requestJson);

		// Validate and parse response
		if (!result) {
			throw new PasskeyError({
				name: PasskeyErrorCode.PasskeyRetrievalFailed,
				message: 'No response received from native module',
				recoverySuggestion: 'Try the operation again',
			});
		}

		try {
			const parsedResult = JSON.parse(result) as PasskeyGetResultJson;

			// Validate parsed result structure
			if (!parsedResult.id || !parsedResult.response || !parsedResult.type) {
				throw new PasskeyError({
					name: PasskeyErrorCode.PasskeyRetrievalFailed,
					message: 'Invalid response format from native module',
					recoverySuggestion: 'Ensure the device supports passkey operations',
				});
			}

			// Validate response type
			if (parsedResult.type !== 'public-key') {
				throw new PasskeyError({
					name: PasskeyErrorCode.PasskeyRetrievalFailed,
					message: 'Invalid credential type in response',
					recoverySuggestion: 'Ensure the device supports WebAuthn credentials',
				});
			}

			return parsedResult;
		} catch (parseError) {
			if (parseError instanceof PasskeyError) {
				throw parseError;
			}
			throw new PasskeyError({
				name: PasskeyErrorCode.PasskeyRetrievalFailed,
				message: 'Failed to parse native module response',
				recoverySuggestion: 'Try the operation again',
				underlyingError: parseError,
			});
		}
	} catch (error) {
		// Handle native module specific errors
		if (error instanceof Error && 'code' in error) {
			switch (error.code) {
				case 'UserCancelled':
					throw new PasskeyError({
						name: PasskeyErrorCode.PasskeyAuthenticationCanceled,
						message: 'User cancelled the authentication',
						recoverySuggestion: 'The user can try authenticating again',
					});
				case 'NotSupported':
					throw new PasskeyError({
						name: PasskeyErrorCode.PasskeyNotSupported,
						message: 'Passkeys are not supported on this device',
						recoverySuggestion:
							'Try using a device that supports passkey authentication',
					});
				case 'NotConfigured':
					throw new PasskeyError({
						name: PasskeyErrorCode.InvalidPasskeyAuthenticationOptions,
						message: 'Passkey authentication is not properly configured',
						recoverySuggestion: 'Check your passkey configuration',
					});
				case 'NoCredentials':
					throw new PasskeyError({
						name: PasskeyErrorCode.PasskeyRetrievalFailed,
						message: 'No passkey credentials found',
						recoverySuggestion:
							'Register a passkey before attempting authentication',
					});
			}
		}

		// If it's already a PasskeyError, rethrow it
		if (error instanceof PasskeyError) {
			throw error;
		}

		// Handle any other errors
		throw new PasskeyError({
			name: PasskeyErrorCode.PasskeyRetrievalFailed,
			message: 'Failed to retrieve passkey',
			recoverySuggestion:
				'Try the operation again or check device compatibility',
			underlyingError: error,
		});
	}
};

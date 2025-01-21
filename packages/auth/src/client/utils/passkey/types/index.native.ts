// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PasskeyErrorCode, assertPasskeyError } from '../errors';

/**
 * Passkey Create Types
 */
export {
	PkcAttestationResponse,
	PasskeyCreateOptionsJson,
	PasskeyCreateResultJson,
	assertValidCredentialCreationOptions,
} from './shared';

/**
 * Passkey Get Types
 */
export {
	PkcAssertionResponse,
	PasskeyGetOptionsJson,
	PasskeyGetResultJson,
} from './shared';

// Native-specific type assertions
export function assertValidNativeResponse(response: any): void {
	assertPasskeyError(
		response &&
			typeof response === 'object' &&
			typeof response.clientDataJSON === 'string',
		PasskeyErrorCode.PasskeyRetrievalFailed,
	);
}

// For registration response
export function assertValidNativeRegistrationResponse(response: any): void {
	assertPasskeyError(
		response &&
			typeof response === 'object' &&
			typeof response.clientDataJSON === 'string' &&
			typeof response.attestationObject === 'string',
		PasskeyErrorCode.PasskeyRegistrationFailed,
	);
}

// For authentication response
export function assertValidNativeAuthenticationResponse(response: any): void {
	assertPasskeyError(
		response &&
			typeof response === 'object' &&
			typeof response.clientDataJSON === 'string' &&
			typeof response.authenticatorData === 'string' &&
			typeof response.signature === 'string',
		PasskeyErrorCode.PasskeyRetrievalFailed,
	);
}

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

export type PkcWithAuthenticatorAttestationResponse = Omit<
	PublicKeyCredential,
	'response'
> & {
	response: AuthenticatorAttestationResponse;
};

export function assertCredentialIsPkcWithAuthenticatorAttestationResponse(
	credential: any,
): asserts credential is PkcWithAuthenticatorAttestationResponse {
	assertPasskeyError(
		credential &&
			credential instanceof PublicKeyCredential &&
			credential.response instanceof AuthenticatorAttestationResponse,
		PasskeyErrorCode.PasskeyRegistrationFailed,
	);
}

/**
 * Passkey Get Types
 */

export {
	PkcAssertionResponse,
	PasskeyGetOptionsJson,
	PasskeyGetResultJson,
} from './shared';

export type PkcWithAuthenticatorAssertionResponse = Omit<
	PublicKeyCredential,
	'response'
> & {
	response: AuthenticatorAssertionResponse;
};

export function assertCredentialIsPkcWithAuthenticatorAssertionResponse(
	credential: any,
): asserts credential is PkcWithAuthenticatorAssertionResponse {
	assertPasskeyError(
		credential &&
			credential instanceof PublicKeyCredential &&
			credential.response instanceof AuthenticatorAssertionResponse,
		PasskeyErrorCode.PasskeyRetrievalFailed,
	);
}

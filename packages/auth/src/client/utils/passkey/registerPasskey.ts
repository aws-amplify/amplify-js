// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	PasskeyCreateOptionsJson,
	assertCredentialIsPkcWithAuthenticatorAttestationResponse,
} from './types';
import {
	deserializeJsonToPkcCreationOptions,
	serializePkcWithAttestationToJson,
} from './serde';
import { PasskeyErrorCode, assertPasskeyError } from './errors';
import { getIsPasskeySupported } from './getIsPasskeySupported';

/**
 * Registers a new passkey for user
 * @param input - PasskeyCreateOptionsJson
 * @returns serialized PasskeyCreateResult
 */
export const registerPasskey = async (input: PasskeyCreateOptionsJson) => {
	const isPasskeySupported = getIsPasskeySupported();

	assertPasskeyError(isPasskeySupported, PasskeyErrorCode.PasskeyNotSupported);

	const passkeyCreationOptions = deserializeJsonToPkcCreationOptions(input);

	const credential = await navigator.credentials.create({
		publicKey: passkeyCreationOptions,
	});

	assertCredentialIsPkcWithAuthenticatorAttestationResponse(credential);

	return serializePkcWithAttestationToJson(credential);
};

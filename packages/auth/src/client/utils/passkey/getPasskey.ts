// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PasskeyErrorCode, assertPasskeyError } from './errors';
import { getIsPasskeySupported } from './getIsPasskeySupported';
import {
	deserializeJsonToPkcGetOptions,
	serializePkcWithAssertionToJson,
} from './serde';
import {
	PasskeyGetOptionsJson,
	assertCredentialIsPkcWithAuthenticatorAssertionResponse,
} from './types';

export const getPasskey = async (input: PasskeyGetOptionsJson) => {
	const isPasskeySupported = getIsPasskeySupported();

	assertPasskeyError(isPasskeySupported, PasskeyErrorCode.PasskeyNotSupported);

	const passkeyGetOptions = deserializeJsonToPkcGetOptions(input);

	const credential = await navigator.credentials.get({
		publicKey: passkeyGetOptions,
	});

	assertCredentialIsPkcWithAuthenticatorAssertionResponse(credential);

	return serializePkcWithAssertionToJson(credential);
};

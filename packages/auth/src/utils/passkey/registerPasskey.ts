// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PasskeyCreateOptionsJson, PasskeyCreateResult } from './types';
import {
	deserializeJsonToPkcCreationOptions,
	serializePkcToJson,
} from './serde';
import { PasskeyErrorCode, assertPasskeyError } from './errors';

/**
 * Registers a new passkey for user
 * @param input - PasskeyCreateOptions
 * @returns serialized PasskeyCreateResult
 */
export const registerPasskey = async (input: PasskeyCreateOptionsJson) => {
	const passkeyCreationOptions = deserializeJsonToPkcCreationOptions(input);

	const credential = (await navigator.credentials.create({
		publicKey: passkeyCreationOptions,
	})) as PasskeyCreateResult | null;

	assertPasskeyError(!!credential, PasskeyErrorCode.PasskeyRegistrationFailed);

	return serializePkcToJson(credential);
};

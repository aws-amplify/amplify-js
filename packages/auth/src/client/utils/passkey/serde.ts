// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	convertArrayBufferToBase64Url,
	convertBase64UrlToArrayBuffer,
} from '../../../foundation/convert';

import {
	PasskeyCreateOptions,
	PasskeyCreateOptionsJson,
	PasskeyCreateResult,
	PasskeyCreateResultJson,
} from './types';

/**
 * Deserializes Public Key Credential JSON
 * @param input PasskeyCreateOptionsJson
 * @returns PasskeyCreateOptions
 */
export const deserializeJsonToPkcCreationOptions = (
	input: PasskeyCreateOptionsJson,
): PasskeyCreateOptions => {
	const userIdBuffer = convertBase64UrlToArrayBuffer(input.user.id);
	const challengeBuffer = convertBase64UrlToArrayBuffer(input.challenge);
	const excludeCredentialsWithBuffer = (input.excludeCredentials || []).map(
		excludeCred => ({
			...excludeCred,
			id: convertBase64UrlToArrayBuffer(excludeCred.id),
		}),
	);

	return {
		...input,
		excludeCredentials: excludeCredentialsWithBuffer,
		challenge: challengeBuffer,
		user: {
			...input.user,
			id: userIdBuffer,
		},
	};
};

/**
 * Serializes a Public Key Credential to JSON
 * @param input PasskeyCreateResult
 * @returns PasskeyCreateResultJson
 */
export const serializePkcToJson = (
	input: PasskeyCreateResult,
): PasskeyCreateResultJson => {
	return {
		type: input.type,
		id: input.id,
		rawId: convertArrayBufferToBase64Url(input.rawId),
		response: {
			clientDataJSON: convertArrayBufferToBase64Url(
				input.response.clientDataJSON,
			),
			attestationObject: convertArrayBufferToBase64Url(
				input.response.attestationObject,
			),
		},
	};
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	convertArrayBufferToBase64Url,
	convertBase64UrlToArrayBuffer,
} from '../../../foundation/convert';

import {
	PasskeyCreateOptionsJson,
	PasskeyCreateResultJson,
	PasskeyGetOptionsJson,
	PasskeyGetResultJson,
	PkcAssertionResponse,
	PkcAttestationResponse,
	PkcWithAuthenticatorAssertionResponse,
	PkcWithAuthenticatorAttestationResponse,
} from './types';

/**
 * Deserializes Public Key Credential Creation Options JSON
 * @param input PasskeyCreateOptionsJson
 * @returns PublicKeyCredentialCreationOptions
 */
export const deserializeJsonToPkcCreationOptions = (
	input: PasskeyCreateOptionsJson,
): PublicKeyCredentialCreationOptions => {
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
 * Serializes a Public Key Credential With Attestation to JSON
 * @param input PasskeyCreateResult
 * @returns PasskeyCreateResultJson
 */
export const serializePkcWithAttestationToJson = (
	input: PkcWithAuthenticatorAttestationResponse,
): PasskeyCreateResultJson => {
	const response: PkcAttestationResponse<string> = {
		clientDataJSON: convertArrayBufferToBase64Url(
			input.response.clientDataJSON,
		),
		attestationObject: convertArrayBufferToBase64Url(
			input.response.attestationObject,
		),
		transports: input.response.getTransports(),
		publicKeyAlgorithm: input.response.getPublicKeyAlgorithm(),
		authenticatorData: convertArrayBufferToBase64Url(
			input.response.getAuthenticatorData(),
		),
	};

	const publicKey = input.response.getPublicKey();

	if (publicKey) {
		response.publicKey = convertArrayBufferToBase64Url(publicKey);
	}

	const resultJson: PasskeyCreateResultJson = {
		type: input.type,
		id: input.id,
		rawId: convertArrayBufferToBase64Url(input.rawId),
		clientExtensionResults: input.getClientExtensionResults(),
		response,
	};

	if (input.authenticatorAttachment) {
		resultJson.authenticatorAttachment = input.authenticatorAttachment;
	}

	return resultJson;
};

/**
 * Deserializes Public Key Credential Get Options JSON
 * @param input PasskeyGetOptionsJson
 * @returns PublicKeyCredentialRequestOptions
 */
export const deserializeJsonToPkcGetOptions = (
	input: PasskeyGetOptionsJson,
): PublicKeyCredentialRequestOptions => {
	const challengeBuffer = convertBase64UrlToArrayBuffer(input.challenge);
	const allowedCredentialsWithBuffer = (input.allowCredentials || []).map(
		allowedCred => ({
			...allowedCred,
			id: convertBase64UrlToArrayBuffer(allowedCred.id),
		}),
	);

	return {
		...input,
		challenge: challengeBuffer,
		allowCredentials: allowedCredentialsWithBuffer,
	};
};

/**
 * Serializes a Public Key Credential With Attestation to JSON
 * @param input PasskeyGetResult
 * @returns PasskeyGetResultJson
 */
export const serializePkcWithAssertionToJson = (
	input: PkcWithAuthenticatorAssertionResponse,
): PasskeyGetResultJson => {
	const response: PkcAssertionResponse<string> = {
		clientDataJSON: convertArrayBufferToBase64Url(
			input.response.clientDataJSON,
		),
		authenticatorData: convertArrayBufferToBase64Url(
			input.response.authenticatorData,
		),
		signature: convertArrayBufferToBase64Url(input.response.signature),
	};

	if (input.response.userHandle) {
		response.userHandle = convertArrayBufferToBase64Url(
			input.response.userHandle,
		);
	}

	const resultJson: PasskeyGetResultJson = {
		id: input.id,
		rawId: convertArrayBufferToBase64Url(input.rawId),
		type: input.type,
		clientExtensionResults: input.getClientExtensionResults(),
		response,
	};

	if (input.authenticatorAttachment) {
		resultJson.authenticatorAttachment = input.authenticatorAttachment;
	}

	return resultJson;
};

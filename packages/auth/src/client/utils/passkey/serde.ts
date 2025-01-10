// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	convertArrayBufferToBase64Url,
	convertBase64UrlToArrayBuffer,
} from '../../../foundation/convert';

import { PasskeyError, PasskeyErrorCode } from './errors';
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
 * Validates base64URL string format
 * @param input string to validate
 * @returns boolean
 */
const isValidBase64Url = (input: string): boolean => {
	const base64UrlRegex = /^[A-Za-z0-9_-]*$/;

	return base64UrlRegex.test(input);
};

/**
 * Deserializes Public Key Credential Creation Options JSON
 * @param input PasskeyCreateOptionsJson
 * @returns PublicKeyCredentialCreationOptions
 * @throws PasskeyError if validation fails
 */
export const deserializeJsonToPkcCreationOptions = (
	input: PasskeyCreateOptionsJson,
): PublicKeyCredentialCreationOptions => {
	try {
		// Validate required fields
		if (!input?.user?.id || !input?.challenge) {
			throw new PasskeyError({
				name: PasskeyErrorCode.InvalidPasskeyRegistrationOptions,
				message: 'Missing required fields in creation options',
				recoverySuggestion:
					'Ensure all required fields are provided in the input options',
			});
		}

		// Validate base64URL format
		if (
			!isValidBase64Url(input.user.id) ||
			!isValidBase64Url(input.challenge)
		) {
			throw new PasskeyError({
				name: PasskeyErrorCode.InvalidPasskeyRegistrationOptions,
				message: 'Invalid base64URL format in input',
				recoverySuggestion:
					'Ensure input strings are properly base64URL encoded',
			});
		}

		const userIdBuffer = convertBase64UrlToArrayBuffer(input.user.id);
		const challengeBuffer = convertBase64UrlToArrayBuffer(input.challenge);

		// Validate exclude credentials if present
		const excludeCredentialsWithBuffer = (input.excludeCredentials || []).map(
			excludeCred => {
				if (!excludeCred.id || !isValidBase64Url(excludeCred.id)) {
					throw new PasskeyError({
						name: PasskeyErrorCode.InvalidPasskeyRegistrationOptions,
						message: 'Invalid credential ID in excludeCredentials',
						recoverySuggestion:
							'Ensure all credential IDs are properly base64URL encoded',
					});
				}

				return {
					...excludeCred,
					id: convertBase64UrlToArrayBuffer(excludeCred.id),
				};
			},
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
	} catch (error) {
		if (error instanceof PasskeyError) {
			throw error;
		}
		throw new PasskeyError({
			name: PasskeyErrorCode.InvalidPasskeyRegistrationOptions,
			message: 'Failed to deserialize creation options',
			recoverySuggestion: 'Check the format of your input data',
			underlyingError: error,
		});
	}
};

/**
 * Serializes a Public Key Credential With Attestation to JSON
 * @param input PasskeyCreateResult
 * @returns PasskeyCreateResultJson
 * @throws PasskeyError if serialization fails
 */
export const serializePkcWithAttestationToJson = (
	input: PkcWithAuthenticatorAttestationResponse,
): PasskeyCreateResultJson => {
	try {
		if (
			!input?.response?.clientDataJSON ||
			!input?.response?.attestationObject
		) {
			throw new PasskeyError({
				name: PasskeyErrorCode.PasskeyRegistrationFailed,
				message: 'Missing required attestation data',
				recoverySuggestion:
					'Ensure the attestation response contains all required fields',
			});
		}

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
	} catch (error) {
		if (error instanceof PasskeyError) {
			throw error;
		}
		throw new PasskeyError({
			name: PasskeyErrorCode.PasskeyRegistrationFailed,
			message: 'Failed to serialize attestation response',
			recoverySuggestion: 'Check the format of the attestation response',
			underlyingError: error,
		});
	}
};

/**
 * Deserializes Public Key Credential Get Options JSON
 * @param input PasskeyGetOptionsJson
 * @returns PublicKeyCredentialRequestOptions
 * @throws PasskeyError if validation fails
 */
export const deserializeJsonToPkcGetOptions = (
	input: PasskeyGetOptionsJson,
): PublicKeyCredentialRequestOptions => {
	try {
		if (!input?.challenge) {
			throw new PasskeyError({
				name: PasskeyErrorCode.InvalidPasskeyAuthenticationOptions,
				message: 'Missing challenge in get options',
				recoverySuggestion: 'Ensure challenge is provided in the input options',
			});
		}

		if (!isValidBase64Url(input.challenge)) {
			throw new PasskeyError({
				name: PasskeyErrorCode.InvalidPasskeyAuthenticationOptions,
				message: 'Invalid challenge format',
				recoverySuggestion: 'Ensure challenge is properly base64URL encoded',
			});
		}

		const challengeBuffer = convertBase64UrlToArrayBuffer(input.challenge);
		const allowedCredentialsWithBuffer = (input.allowCredentials || []).map(
			allowedCred => {
				if (!allowedCred.id || !isValidBase64Url(allowedCred.id)) {
					throw new PasskeyError({
						name: PasskeyErrorCode.InvalidPasskeyAuthenticationOptions,
						message: 'Invalid credential ID in allowCredentials',
						recoverySuggestion:
							'Ensure all credential IDs are properly base64URL encoded',
					});
				}

				return {
					...allowedCred,
					id: convertBase64UrlToArrayBuffer(allowedCred.id),
				};
			},
		);

		return {
			...input,
			challenge: challengeBuffer,
			allowCredentials: allowedCredentialsWithBuffer,
		};
	} catch (error) {
		if (error instanceof PasskeyError) {
			throw error;
		}
		throw new PasskeyError({
			name: PasskeyErrorCode.InvalidPasskeyAuthenticationOptions,
			message: 'Failed to deserialize get options',
			recoverySuggestion: 'Check the format of your input data',
			underlyingError: error,
		});
	}
};

/**
 * Serializes a Public Key Credential With Assertion to JSON
 * @param input PasskeyGetResult
 * @returns PasskeyGetResultJson
 * @throws PasskeyError if serialization fails
 */
export const serializePkcWithAssertionToJson = (
	input: PkcWithAuthenticatorAssertionResponse,
): PasskeyGetResultJson => {
	try {
		if (
			!input?.response?.clientDataJSON ||
			!input?.response?.authenticatorData ||
			!input?.response?.signature
		) {
			throw new PasskeyError({
				name: PasskeyErrorCode.PasskeyRetrievalFailed,
				message: 'Missing required assertion data',
				recoverySuggestion:
					'Ensure the assertion response contains all required fields',
			});
		}

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
	} catch (error) {
		if (error instanceof PasskeyError) {
			throw error;
		}
		throw new PasskeyError({
			name: PasskeyErrorCode.PasskeyRetrievalFailed,
			message: 'Failed to serialize assertion response',
			recoverySuggestion: 'Check the format of the assertion response',
			underlyingError: error,
		});
	}
};

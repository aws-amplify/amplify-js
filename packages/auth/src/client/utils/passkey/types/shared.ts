// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type PasskeyTransport = 'ble' | 'hybrid' | 'internal' | 'nfc' | 'usb';
type UserVerificationRequirement = 'discouraged' | 'preferred' | 'required';

interface PkcDescriptor<T> {
	type: 'public-key';
	id: T;
	transports?: PasskeyTransport[];
}

/**
 * Passkey Create Types
 */
export interface PasskeyCreateOptionsJson {
	challenge: string;
	rp: {
		id: string;
		name: string;
	};
	user: {
		id: string;
		name: string;
		displayName: string;
	};
	pubKeyCredParams: {
		alg: number;
		type: 'public-key';
	}[];
	timeout: number;
	excludeCredentials: PkcDescriptor<string>[];
	authenticatorSelection: {
		requireResidentKey: boolean;
		residentKey: UserVerificationRequirement;
		userVerification: UserVerificationRequirement;
	};
}

export interface PkcAttestationResponse<T> {
	clientDataJSON: T;
	attestationObject: T;
	transports: string[];
	publicKey?: string;
	publicKeyAlgorithm: number;
	authenticatorData: T;
}
export interface PasskeyCreateResult {
	id: string;
	rawId: ArrayBuffer;
	type: 'public-key';
	response: PkcAttestationResponse<ArrayBuffer>;
}

export interface PasskeyCreateResultJson {
	id: string;
	rawId: string;
	type: string;
	clientExtensionResults: {
		appId?: boolean;
		credProps?: { rk?: boolean };
		hmacCreateSecret?: boolean;
	};
	authenticatorAttachment?: string;
	response: PkcAttestationResponse<string>;
}

/**
 * Passkey Get Types
 */
export interface PasskeyGetOptionsJson {
	challenge: string;
	rpId: string;
	timeout: number;
	allowCredentials: PkcDescriptor<string>[];
	userVerification: UserVerificationRequirement;
}

export interface PkcAssertionResponse<T> {
	authenticatorData: T;
	clientDataJSON: T;
	signature: T;
	userHandle?: T;
}

export interface PasskeyGetResult {
	id: string;
	rawId: ArrayBuffer;
	type: 'public-key';
	response: PkcAssertionResponse<ArrayBuffer>;
}
export interface PasskeyGetResultJson {
	id: string;
	rawId: string;
	type: string;
	clientExtensionResults: {
		appId?: boolean;
		credProps?: { rk?: boolean };
		hmacCreateSecret?: boolean;
	};
	authenticatorAttachment?: string;
	response: PkcAssertionResponse<string>;
}

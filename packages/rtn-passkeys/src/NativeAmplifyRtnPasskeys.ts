// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
	multiply(a: number, b: number): number;
	getIsPasskeySupported(): boolean;
	createPasskey(
		input: PasskeyCreateOptionsJson,
	): Promise<PasskeyCreateResultJson>;
	getPasskey(input: PasskeyGetOptionsJson): Promise<PasskeyGetResultJson>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('AmplifyRtnPasskeys');

// Passkey Types
type PasskeyTransport = 'ble' | 'hybrid' | 'internal' | 'nfc' | 'usb';
type UserVerificationRequirement = 'discouraged' | 'preferred' | 'required';
type AttestationConveyancePreference =
	| 'direct'
	| 'enterprise'
	| 'indirect'
	| 'none';

interface PkcDescriptor {
	type: 'public-key';
	id: string;
	transports?: PasskeyTransport[];
}

interface PubKeyCredParam {
	alg: number;
	type: 'public-key';
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
	pubKeyCredParams: PubKeyCredParam[];
	timeout?: number;
	excludeCredentials?: PkcDescriptor[];
	authenticatorSelection?: {
		requireResidentKey: boolean;
		residentKey: UserVerificationRequirement;
		userVerification: UserVerificationRequirement;
	};
	attestation?: AttestationConveyancePreference;
	extensions?: {
		appid?: string;
		appidExclude?: string;
		credProps?: boolean;
	};
}

interface PkcAttestationResponseJson {
	clientDataJSON: string;
	attestationObject: string;
	transports: string[];
	publicKey?: string;
	publicKeyAlgorithm: number;
	authenticatorData: string;
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
	response: PkcAttestationResponseJson;
}

/**
 * Passkey Get Types
 */
export interface PasskeyGetOptionsJson {
	challenge: string;
	rpId: string;
	timeout: number;
	allowCredentials: PkcDescriptor[];
	userVerification: UserVerificationRequirement;
}

interface PkcAssertionResponseJson {
	authenticatorData: string;
	clientDataJSON: string;
	signature: string;
	userHandle?: string;
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
	response: PkcAssertionResponseJson;
}

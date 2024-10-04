// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

type PasskeyTransport = 'ble' | 'hybrid' | 'internal' | 'nfc' | 'usb';
type UserVerificationRequirement = 'discouraged' | 'preferred' | 'required';

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
	excludeCredentials: {
		type: 'public-key';
		id: string;
		transports?: PasskeyTransport[];
	}[];
	authenticatorSelection: {
		requireResidentKey: boolean;
		residentKey: UserVerificationRequirement;
		userVerification: UserVerificationRequirement;
	};
}

export interface PasskeyCreateOptions {
	challenge: ArrayBuffer;
	rp: {
		id: string;
		name: string;
	};
	user: {
		id: ArrayBuffer;
		name: string;
		displayName: string;
	};
	pubKeyCredParams: {
		alg: number;
		type: 'public-key';
	}[];
	timeout: number;
	excludeCredentials: {
		type: 'public-key';
		id: ArrayBuffer;
		transports?: PasskeyTransport[];
	}[];
	authenticatorSelection: {
		requireResidentKey: boolean;
		residentKey: UserVerificationRequirement;
		userVerification: UserVerificationRequirement;
	};
}

export interface PasskeyCreateResult {
	id: string;
	rawId: ArrayBuffer;
	type: 'public-key';
	response: {
		clientDataJSON: ArrayBuffer;
		attestationObject: ArrayBuffer;
	};
}

export interface PasskeyCreateResultJson {
	id: string;
	rawId: string;
	type: 'public-key';
	response: {
		clientDataJSON: string;
		attestationObject: string;
	};
}

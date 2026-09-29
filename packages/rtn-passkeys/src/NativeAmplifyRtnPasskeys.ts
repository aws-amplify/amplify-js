// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
	getIsPasskeySupported(): boolean;
	createPasskey(
		input: PasskeyCreateOptionsJson,
	): Promise<PasskeyCreateResultJson>;
	getPasskey(input: PasskeyGetOptionsJson): Promise<PasskeyGetResultJson>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('AmplifyRtnPasskeys');

/**
 * Note: TurboModule codegen requires types are defined in same file as spec; not imported
 */

// Passkey Types
// Note: these are typed as plain strings rather than string-literal unions because
// older React Native codegen (e.g. 0.76) rejects unions inside structs on iOS. The native
// interfaces receive strings either way.

/** One of 'ble' | 'hybrid' | 'internal' | 'nfc' | 'usb' */
type PasskeyTransport = string;
/** One of 'discouraged' | 'preferred' | 'required' */
type UserVerificationRequirement = string;

interface PkcDescriptor {
	/** Always 'public-key' */
	type: string;
	id: string;
	transports?: PasskeyTransport[];
}

/**
 * Passkey Create Types
 */
interface PasskeyCreateOptionsJson {
	challenge: string;
	rp: { id: string; name: string };
	user: { id: string; name: string; displayName: string };
	excludeCredentials?: PkcDescriptor[];
}

interface PkcAttestationResponseJson {
	clientDataJSON: string;
	attestationObject: string;
	transports: string[];
}

interface PasskeyCreateResultJson {
	id: string;
	rawId: string;
	type: string;
	authenticatorAttachment?: string;
	response: PkcAttestationResponseJson;
}

/**
 * Passkey Get Types
 */
interface PasskeyGetOptionsJson {
	challenge: string;
	rpId: string;
	allowCredentials?: PkcDescriptor[];
	userVerification: UserVerificationRequirement;
}

interface PkcAssertionResponseJson {
	authenticatorData: string;
	clientDataJSON: string;
	signature: string;
	userHandle?: string;
}

interface PasskeyGetResultJson {
	id: string;
	rawId: string;
	type: string;
	response: PkcAssertionResponseJson;
	authenticatorAttachment?: string;
}

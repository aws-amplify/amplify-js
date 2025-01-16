import type {
	PasskeyCreateOptionsJson,
	PasskeyCreateResultJson,
	PasskeyGetOptionsJson,
	PasskeyGetResultJson,
} from './shared';

// Re-export shared types that are used in native implementation
export type {
	PasskeyCreateOptionsJson,
	PasskeyCreateResultJson,
	PasskeyGetOptionsJson,
	PasskeyGetResultJson,
};

// Native-specific type for credential assertion response
export interface NativeCredentialAssertionResponse {
	authenticatorData: string;
	clientDataJSON: string;
	signature: string;
	userHandle?: string;
}

// Native-specific type for credential attestation response
export interface NativeCredentialAttestationResponse {
	clientDataJSON: string;
	attestationObject: string;
	transports?: string[];
}

// Helper function to validate native response format
export function isValidNativeResponse(response: any): boolean {
	return Boolean(
		response &&
			typeof response === 'object' &&
			typeof response.clientDataJSON === 'string' &&
			// For attestation response
			(typeof response.attestationObject === 'string' ||
				// For assertion response
				(typeof response.authenticatorData === 'string' &&
					typeof response.signature === 'string')),
	);
}

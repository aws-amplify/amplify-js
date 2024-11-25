// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Shape of a WebAuthn credential
 */
export interface AuthWebAuthnCredential {
	credentialId: string | undefined;
	friendlyCredentialName: string | undefined;
	relyingPartyId: string | undefined;
	authenticatorAttachment?: string;
	authenticatorTransports: string[] | undefined;
	createdAt: Date | undefined;
}

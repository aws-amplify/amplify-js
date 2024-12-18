// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Input type for Cognito listWebAuthnCredentials API.
 */
export interface ListWebAuthnCredentialsInput {
	pageSize?: number;
	nextToken?: string;
}

export interface DeleteWebAuthnCredentialInput {
	credentialId: string;
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthWebAuthnCredential } from './models';

/**
 * Output type for Cognito listWebAuthnCredentials API.
 */
export interface ListWebAuthnCredentialsOutput {
	credentials: AuthWebAuthnCredential[];
	nextToken?: string;
}

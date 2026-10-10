// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getGlobalContext } from '@aws-amplify/core';

import { ListWebAuthnCredentialsException } from '../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import {
	ListWebAuthnCredentialsInput,
	ListWebAuthnCredentialsOutput,
} from '../../foundation/types';
import { AuthError } from '../../errors/AuthError';
import { listWebAuthnCredentials as listWebAuthnCredentialsFoundation } from '../../foundation/apis';

/**
 * Lists registered credentials for an authenticated user
 *
 * @param {ListWebAuthnCredentialsInput} input The list input parameters including page size and next token.
 * @returns Promise<ListWebAuthnCredentialsOutput>
 * @throws - {@link AuthError}:
 * - Thrown when user is unauthenticated
 * @throws - {@link ListWebAuthnCredentialsException}
 * - Thrown due to a service error when listing WebAuthn credentials
 */
export async function listWebAuthnCredentials(
	input?: ListWebAuthnCredentialsInput,
): Promise<ListWebAuthnCredentialsOutput> {
	// Resolve the global AmplifyContext fresh per operation so facade-only
	// configuration is honored (the core `Amplify` singleton is never
	// configured under the new facade).
	return listWebAuthnCredentialsFoundation(getGlobalContext(), input);
}

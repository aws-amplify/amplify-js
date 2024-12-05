// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

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
	return listWebAuthnCredentialsFoundation(Amplify, input);
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import { resolveCtxArgs } from '@aws-amplify/core/internals/utils';

import { DeleteWebAuthnCredentialException } from '../../foundation/factories/serviceClients/cognitoIdentityProvider/types';
import { DeleteWebAuthnCredentialInput } from '../../foundation/types';
import { AuthError } from '../../errors/AuthError';
import { deleteWebAuthnCredential as deleteWebAuthnCredentialFoundation } from '../../foundation/apis';

/**
 * Delete a registered credential for an authenticated user by credentialId
 * @param {DeleteWebAuthnCredentialInput} input The delete input parameters including the credentialId
 * @returns Promise<void>
 * @throws - {@link AuthError}:
 * - Thrown when user is unauthenticated
 * @throws - {@link DeleteWebAuthnCredentialException}
 * - Thrown due to a service error when deleting a WebAuthn credential
 */
export async function deleteWebAuthnCredential(
	input: DeleteWebAuthnCredentialInput,
): Promise<void>;
export async function deleteWebAuthnCredential(
	ctx: AmplifyContext,
	input: DeleteWebAuthnCredentialInput,
): Promise<void>;
export async function deleteWebAuthnCredential(...args: any[]): Promise<void> {
	const [ctx, input] = resolveCtxArgs<DeleteWebAuthnCredentialInput>(args);

	return deleteWebAuthnCredentialFoundation(ctx, input);
}

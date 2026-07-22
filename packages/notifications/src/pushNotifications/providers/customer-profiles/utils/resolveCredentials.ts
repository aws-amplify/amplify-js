// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';

import { PushNotificationError } from '../../../errors';
import { PushNotificationValidationErrorCode } from '../../../errors/errorHelpers';

/**
 * Resolves the Identity Pool credentials used to SigV4-sign requests to the
 * Amazon Connect Customer Profiles endpoint.
 *
 * The same credentials are used for authenticated (Cognito user-pool users
 * assume the Identity Pool auth role) and guest (Identity Pool unauth role)
 * callers — both are signed identically with `execute-api` SigV4. The backend
 * derives `principalId` from the signer identity, so no identity field is sent
 * by the client.
 *
 * @internal
 */
export const resolveCredentials = async () => {
	const { credentials } = await fetchAuthSession();

	// Explicit throw (not assert) so TypeScript narrows `credentials` to
	// non-undefined for the returned value.
	if (!credentials) {
		throw new PushNotificationError({
			name: PushNotificationValidationErrorCode.NoCredentials,
			message: 'Credentials should not be empty.',
		});
	}

	return { credentials };
};

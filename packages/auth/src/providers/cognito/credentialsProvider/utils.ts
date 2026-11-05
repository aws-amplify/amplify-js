// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { decodeJWT } from '@aws-amplify/core/internals/utils';

import { AuthError } from '../../../errors/AuthError';

export function formLoginsMap(idToken: string) {
	const issuer = decodeJWT(idToken).payload.iss;
	const res: Record<string, string> = {};
	if (!issuer) {
		throw new AuthError({
			name: 'InvalidIdTokenException',
			message: 'Invalid Idtoken.',
		});
	}
	const domainName: string = issuer.replace(/(^\w+:|^)\/\//, '');

	res[domainName] = idToken;

	return res;
}

/**
 * Returns true when Cognito rejected an identityId used for guest access
 * because the identityId itself can't be used: it was deleted or never
 * existed, it is linked to a login, or it is malformed.
 *
 * Other errors, such as throttling, network errors or an identity pool that
 * doesn't allow guest access, return false: getting a new identityId would
 * not help with them.
 */
export function isUnusableGuestIdentityIdError(error: unknown): boolean {
	if (!(error instanceof AuthError)) {
		return false;
	}
	const message = error.message ?? '';

	switch (error.name) {
		case 'ResourceNotFoundException':
			// "Identity '<identityId>' not found."
			return true;
		case 'NotAuthorizedException':
			// "Access to Identity '<identityId>' is forbidden."
			return /^Access to Identity '[^']*' is forbidden/.test(message);
		case 'ValidationException':
			// "... Value '<identityId>' at 'identityId' failed to satisfy constraint ..."
			return /at 'identityId'/i.test(message);
		default:
			return false;
	}
}

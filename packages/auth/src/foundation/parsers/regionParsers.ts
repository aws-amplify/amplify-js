// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AuthError } from '../../errors/AuthError';

export function getRegionFromUserPoolId(userPoolId?: string): string {
	const region = userPoolId?.split('_')[0];
	if (
		!userPoolId ||
		userPoolId.indexOf('_') < 0 ||
		!region ||
		typeof region !== 'string'
	)
		throw new AuthError({
			name: 'InvalidUserPoolId',
			message: 'Invalid user pool id provided.',
		});

	return region;
}

export function getRegionFromIdentityPoolId(identityPoolId?: string): string {
	if (!identityPoolId || !identityPoolId.includes(':')) {
		throw new AuthError({
			name: 'InvalidIdentityPoolIdException',
			message: 'Invalid identity pool id provided.',
			recoverySuggestion:
				'Make sure a valid identityPoolId is given in the config.',
		});
	}

	return identityPoolId.split(':')[0];
}

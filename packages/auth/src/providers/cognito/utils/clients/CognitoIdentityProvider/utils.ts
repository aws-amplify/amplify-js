// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthError } from '../../../../../errors/AuthError';

export function getRegion(userPoolId?: string): string {
	const userPoolIdSplit: string[] = userPoolId?.split('_');
	const region = userPoolIdSplit[0];
	if (!region || typeof region !== 'string' || region.length <= 1)
		throw new AuthError({
			name: 'InvalidUserPoolId',
			message: 'Invalid user pool id provided.',
		});
	return region;
}

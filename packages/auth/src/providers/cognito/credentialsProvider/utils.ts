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

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { invalidRedirectException } from '../../../../errors/constants';

/** @internal */
export function getRedirectUrl(
	redirects: string[],
	preferredSignOutUrl?: string,
): string {
	let redirectUrl;
	if (preferredSignOutUrl) {
		redirectUrl = redirects?.find(redirect => redirect === preferredSignOutUrl);
	} else {
		redirectUrl = redirects?.find(
			redirect =>
				!redirect.startsWith('http://') && !redirect.startsWith('https://'),
		);
	}
	if (!redirectUrl) {
		throw invalidRedirectException;
	}

	return redirectUrl;
}

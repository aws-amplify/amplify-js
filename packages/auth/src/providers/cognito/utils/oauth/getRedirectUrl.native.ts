// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { invalidRedirectException } from '../../../../errors/constants';

/** @internal */
export function getRedirectUrl(
	redirects: string[],
	preferredSignOutUrl?: string,
): string {
	let preferredRedirectUrl;
	// Always check for a non http/s url (appScheme)
	const appSchemeRedirectUrl = redirects?.find(
		redirect =>
			!redirect.startsWith('http://') && !redirect.startsWith('https://'),
	);
	if (!appSchemeRedirectUrl) {
		throw invalidRedirectException;
	}
	if (preferredSignOutUrl) {
		preferredRedirectUrl = redirects?.find(
			redirect => redirect === preferredSignOutUrl,
		);
		if (!preferredRedirectUrl) {
			throw invalidRedirectException;
		}
	}

	return preferredRedirectUrl ?? appSchemeRedirectUrl;
}

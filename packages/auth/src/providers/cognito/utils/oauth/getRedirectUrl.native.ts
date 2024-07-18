// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	invalidAppSchemeException,
	invalidPreferredRedirectUrlException,
} from '../../../../errors/constants';

/**
 * An appScheme (non http/s url) is always required to proceed further.
 * If a preferredSignOutUrl is given, then we use that after validating the existence of appScheme.
@internal */
export function getRedirectUrl(
	redirects: string[],
	preferredSignOutUrl?: string,
): string {
	let preferredRedirectUrl;
	// iOS always requires a non http/s url (appScheme) to be registered so we validate it's existence here.
	const appSchemeRedirectUrl = redirects?.find(
		redirect =>
			!redirect.startsWith('http://') && !redirect.startsWith('https://'),
	);
	if (!appSchemeRedirectUrl) {
		throw invalidAppSchemeException;
	}
	if (preferredSignOutUrl) {
		preferredRedirectUrl = redirects?.find(
			redirect => redirect === preferredSignOutUrl,
		);
		if (!preferredRedirectUrl) {
			throw invalidPreferredRedirectUrlException;
		}

		return preferredRedirectUrl;
	}

	return appSchemeRedirectUrl;
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	invalidAppSchemeException,
	invalidPreferredRedirectUrlException,
} from '../../../../errors/constants';

/**
* - Validate there is always an appScheme (required), if not throw invalidAppSchemeException.
* - If a preferredRedirectUrl is given, validate it's in the configured list, if not throw invalidPreferredRedirectUrlException.
* - If preferredRedirectUrl is not given, use the appScheme which is present in the configured list.
@internal */
export function getRedirectUrl(
	redirects: string[],
	preferredRedirectUrl?: string,
): string {
	// iOS always requires a non http/s url (appScheme) to be registered so we validate it's existence here.
	const appSchemeRedirectUrl = redirects?.find(
		redirect =>
			!redirect.startsWith('http://') && !redirect.startsWith('https://'),
	);
	if (!appSchemeRedirectUrl) {
		throw invalidAppSchemeException;
	}
	if (preferredRedirectUrl) {
		if (redirects?.includes(preferredRedirectUrl)) {
			return preferredRedirectUrl;
		}
		throw invalidPreferredRedirectUrlException;
	}

	return appSchemeRedirectUrl;
}

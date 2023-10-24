// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { invalidRedirectException } from '../../../../errors/constants';

/** @internal */
export function getSignInRedirect(redirects: string[]): string {
	const redirect = redirects.find(redirect => {
		return redirect.startsWith(String(window.location.origin + '/'));
	});
	if (!redirect) {
		throw invalidRedirectException;
	}
	return redirect;
}

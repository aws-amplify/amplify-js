// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { invalidRedirectException } from '../../../../errors/constants';

/** @internal */
export function getRedirectUrl(redirects: string[]): string {
	const redirect = redirects?.find(
		redirect =>
			!redirect.startsWith('http://') && !redirect.startsWith('https://')
	);
	if (!redirect) {
		if (redirects.length === 0) {
			throw invalidRedirectException;
		} else {
			// fallsback to available redirect URL. Addresses: https://github.com/aws-amplify/amplify-js/issues/12890
			return redirects[0];
		}
	} 
	return redirect;
}

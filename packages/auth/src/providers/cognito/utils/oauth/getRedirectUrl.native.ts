// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { invalidRedirectException } from '../../../../errors/constants';

/** @internal */
export function getRedirectUrl(redirects: string[]): string {
	const redirectUrl = redirects?.find(
		redirect =>
			!redirect.startsWith('http://') && !redirect.startsWith('https://'),
	);
	if (!redirectUrl) {
		throw invalidRedirectException;
	}

	return redirectUrl;
}

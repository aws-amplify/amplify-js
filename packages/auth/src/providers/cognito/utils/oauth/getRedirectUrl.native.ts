// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { invalidRedirectException } from '~/src/errors/constants';

/** @internal */
export function getRedirectUrl(redirects: string[]): string {
	const redirect = redirects?.find(
		item => !item.startsWith('http://') && !item.startsWith('https://'),
	);
	if (!redirect) {
		throw invalidRedirectException;
	}

	return redirect;
}

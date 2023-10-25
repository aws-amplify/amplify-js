// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { invalidRedirectException } from '../../../../errors/constants';

/** @internal */
export function getRedirectUrl(redirects: string[]): string {
	const redirect =
		redirects.find(isCurrentWindowLocation) ??
		redirects.find(isNotCurrentWindowLocation);
	if (!redirect) {
		throw invalidRedirectException;
	}
	return redirect;
}

const isCurrentWindowLocation = (redirect: string) =>
	redirect.startsWith(String(window.location.origin + '/'));

const isNotCurrentWindowLocation = (redirect: string) =>
	!isCurrentWindowLocation(redirect);

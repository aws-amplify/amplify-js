// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	invalidOriginException,
	invalidRedirectException,
} from '../../../../errors/constants';

/** @internal */
export function getRedirectUrl(redirects: string[]): string {
	const redirectComfingFromTheSameOrigin = redirects?.find(
		isCurrentWindowLocation
	);
	const redirectComingFromDifferentOrigin =
		redirects?.find(isHttps) ?? redirects?.find(isHttp);
	if (redirectComfingFromTheSameOrigin) {
		return redirectComfingFromTheSameOrigin;
	} else if (redirectComingFromDifferentOrigin) {
		throw invalidOriginException;
	}
	throw invalidRedirectException;
}

const isCurrentWindowLocation = (redirect: string) =>
	redirect.startsWith(
		String(window.location.origin + window.location.pathname ?? '/')
	);

const isHttp = (redirect: string) => redirect.startsWith('http://');
const isHttps = (redirect: string) => redirect.startsWith('https://');

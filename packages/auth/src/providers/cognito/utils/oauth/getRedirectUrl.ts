// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	invalidOriginException,
	invalidRedirectException,
} from '../../../../errors/constants';

/** @internal */
export function getRedirectUrl(redirects: string[]): string {
	const redirectUrlFromTheSameOrigin =
		redirects?.find(isSameOriginAndPathName) ??
		redirects?.find(isTheSameDomain);
	const redirectUrlFromDifferentOrigin =
		redirects?.find(isHttps) ?? redirects?.find(isHttp);
	if (redirectUrlFromTheSameOrigin) {
		return redirectUrlFromTheSameOrigin;
	} else if (redirectUrlFromDifferentOrigin) {
		throw invalidOriginException;
	}
	throw invalidRedirectException;
}

// origin + pathname => https://example.com/app
const isSameOriginAndPathName = (redirect: string) =>
	redirect.startsWith(
		String(window.location.origin + window.location.pathname ?? '/')
	);
// domain => outlook.live.com, github.com
const isTheSameDomain = (redirect: string) =>
	redirect.includes(String(window.location.hostname));
const isHttp = (redirect: string) => redirect.startsWith('http://');
const isHttps = (redirect: string) => redirect.startsWith('https://');

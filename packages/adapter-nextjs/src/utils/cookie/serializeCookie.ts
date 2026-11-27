// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CookieStorage } from 'aws-amplify/adapter-core';

import { ensureEncodedForJSCookie } from './ensureEncodedForJSCookie';

export const serializeCookie = (
	name: string,
	value: string,
	options?: CookieStorage.SetCookieOptions,
): string =>
	// Values are percent-encoded, as js-cookie (client side) and
	// `NextResponse.cookies.set` do, so non-ASCII values (e.g. a Cognito username
	// like `用户`) don't break the `Set-Cookie` header and round-trip on read.
	`${ensureEncodedForJSCookie(name)}=${encodeURIComponent(value)};${options ? serializeSetCookieOptions(options) : ''}`;

const serializeSetCookieOptions = (
	options: CookieStorage.SetCookieOptions,
): string => {
	const { expires, domain, httpOnly, sameSite, secure, path, maxAge } = options;
	const serializedOptions: string[] = [];
	if (domain) {
		serializedOptions.push(`Domain=${domain}`);
	}
	if (expires) {
		serializedOptions.push(`Expires=${expires.toUTCString()}`);
	}
	if (httpOnly) {
		serializedOptions.push(`HttpOnly`);
	}
	if (sameSite) {
		serializedOptions.push(`SameSite=${sameSite}`);
	}
	if (secure) {
		serializedOptions.push(`Secure`);
	}
	if (path) {
		serializedOptions.push(`Path=${path}`);
	}
	if (maxAge) {
		serializedOptions.push(`Max-Age=${maxAge}`);
	}

	return serializedOptions.join(';');
};

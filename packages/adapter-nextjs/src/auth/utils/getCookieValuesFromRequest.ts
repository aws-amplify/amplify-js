// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ensureEncodedForJSCookie } from '../../utils/cookie/ensureEncodedForJSCookie';

export const getCookieValuesFromRequest = <CookieNames extends string[]>(
	request: Request,
	cookieNames: CookieNames,
): Partial<Record<CookieNames[number], string | undefined>> => {
	const cookieHeader = request.headers.get('Cookie');

	if (!cookieHeader) {
		return {};
	}

	const cookieValues: Record<string, string | undefined> = cookieHeader
		.split(';')
		.map((cookie): [string, string | undefined] => {
			// Split on the first `=` only, so a raw `=` inside a value written by
			// an older version is kept.
			const trimmed = cookie.trim();
			const separatorIndex = trimmed.indexOf('=');

			return separatorIndex === -1
				? [trimmed, undefined]
				: [trimmed.slice(0, separatorIndex), trimmed.slice(separatorIndex + 1)];
		})
		.reduce<Record<string, string | undefined>>((result, [key, value]) => {
			result[key] = value && decodeCookieValue(value);

			return result;
		}, {});

	// Cookie names are written via `ensureEncodedForJSCookie`, so they appear
	// percent-encoded on the wire when they contain unsafe characters (e.g. `@`
	// in email-based Cognito usernames). Match the lookup keys using the same
	// encoding so reads align with writes.
	const result: Record<string, string | undefined> = {};
	for (const cookieName of cookieNames) {
		result[cookieName] = cookieValues[ensureEncodedForJSCookie(cookieName)];
	}

	return result as Partial<Record<CookieNames[number], string | undefined>>;
};

// Cookie values are written percent-encoded (see `serializeCookie`). Values
// written raw by older versions, or that contain a stray `%`, are returned
// as-is. A legacy raw value that happens to be valid percent-encoding (for
// example `a%41`) is decoded (to `aA`); this is unlikely for real usernames.
const decodeCookieValue = (value: string): string => {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
};

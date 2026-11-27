// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextApiRequest } from 'next';

import { ensureEncodedForJSCookie } from '../../utils/cookie/ensureEncodedForJSCookie';

export const getCookieValuesFromNextApiRequest = <
	CookieNames extends string[],
	R = Partial<Record<CookieNames[number], string | undefined>>,
>(
	request: NextApiRequest,
	cookieNames: CookieNames,
): R => {
	const result: Record<string, string | undefined> = {};

	// Next.js decodes the values in `request.cookies`, but the names keep the
	// percent-encoding applied by `ensureEncodedForJSCookie` on write (e.g. `@`
	// or non-ASCII characters in Cognito usernames).
	for (const cookieName of cookieNames) {
		result[cookieName] = request.cookies[ensureEncodedForJSCookie(cookieName)];
	}

	return result as R;
};

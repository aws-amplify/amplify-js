// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextApiRequest } from 'next';

export const getCookieValuesFromNextApiRequest = <
	CookieNames extends string[],
	R = {
		[key in CookieNames[number]]?: string | undefined;
	},
>(
	request: NextApiRequest,
	cookieNames: CookieNames,
): R => {
	const result: Record<string, string | undefined> = {};

	for (const cookieName of cookieNames) {
		result[cookieName] = request.cookies[cookieName];
	}

	return result as R;
};

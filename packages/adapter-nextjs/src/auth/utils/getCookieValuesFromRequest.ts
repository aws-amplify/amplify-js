// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const getCookieValuesFromRequest = <CookieNames extends string[]>(
	request: Request,
	cookieNames: CookieNames,
): {
	[key in CookieNames[number]]?: string | undefined;
} => {
	const cookieHeader = request.headers.get('Cookie');

	if (!cookieHeader) {
		return {};
	}

	const cookieValues: Record<string, string> = cookieHeader
		.split(';')
		.map(cookie => cookie.trim().split('='))
		.reduce(
			(result, [key, value]) => {
				result[key] = value;

				return result;
			},
			{} as Record<string, string>,
		);

	const result: Record<string, string | undefined> = {};
	for (const cookieName of cookieNames) {
		result[cookieName] = cookieValues[cookieName];
	}

	return result as {
		[key in CookieNames[number]]?: string | undefined;
	};
};

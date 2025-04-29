// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const getCookieValuesFromRequest = <CookieNames extends string[]>(
	request: Request,
	cookieNames: CookieNames,
): Partial<Record<CookieNames[number], string | undefined>> => {
	const cookieHeader = request.headers.get('Cookie');

	if (!cookieHeader) {
		return {};
	}

	const cookieValues: Record<string, string> = cookieHeader
		.split(';')
		.map(cookie => cookie.trim().split('='))
		.reduce<Record<string, string>>((result, [key, value]) => {
			result[key] = value;

			return result;
		}, {});

	const result: Record<string, string | undefined> = {};
	for (const cookieName of cookieNames) {
		result[cookieName] = cookieValues[cookieName];
	}

	return result as Partial<Record<CookieNames[number], string | undefined>>;
};

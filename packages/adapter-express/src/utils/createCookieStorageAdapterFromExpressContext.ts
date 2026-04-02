// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServerContextError,
	CookieStorage,
} from 'aws-amplify/adapter-core/internals';
import {
	ensureEncodedForJSCookie,
	serializeCookie,
} from 'aws-amplify/adapter-core';

import { ExpressServer } from '../types';

export const DATE_IN_THE_PAST = new Date(0);

/**
 * Creates a `CookieStorage.Adapter` from an Express.js request/response pair.
 * Assumes the `cookie-parser` middleware is installed, so `req.cookies` is a
 * plain `{ [name]: value }` object.
 */
export const createCookieStorageAdapterFromExpressContext = (
	context: ExpressServer.Context,
): CookieStorage.Adapter => {
	const { request: req, response: res } = context;

	if (!req || !res || typeof res.setHeader !== 'function') {
		throw new AmplifyServerContextError({
			message:
				'Attempted to create cookie storage adapter from an unsupported Express.js server context.',
		});
	}

	const cookiesMap: Record<string, string> = { ...req.cookies };
	const allCookies = Object.entries(cookiesMap).map(([name, value]) => ({
		name,
		value,
	}));

	return {
		get(name) {
			const value = cookiesMap[ensureEncodedForJSCookie(name)];

			return value ? { name, value } : undefined;
		},
		getAll() {
			return allCookies;
		},
		set(name, value, options) {
			const encodedName = ensureEncodedForJSCookie(name);
			const existingValues = getExistingSetCookieValues(
				res.getHeader('Set-Cookie'),
			);

			if (
				existingValues.findIndex(
					cookieValue =>
						cookieValue.startsWith(`${encodedName}=`) &&
						!cookieValue.startsWith(`${encodedName}=;`),
				) > -1
			) {
				return;
			}

			res.appendHeader('Set-Cookie', serializeCookie(name, value, options));
		},
		delete(name) {
			const encodedName = ensureEncodedForJSCookie(name);
			const setCookieValue = `${encodedName}=;Expires=${DATE_IN_THE_PAST.toUTCString()}`;
			const existingValues = getExistingSetCookieValues(
				res.getHeader('Set-Cookie'),
			);

			if (existingValues.includes(setCookieValue)) {
				return;
			}

			res.appendHeader('Set-Cookie', setCookieValue);
		},
	};
};

const getExistingSetCookieValues = (
	values: number | string | string[] | undefined,
): string[] =>
	values === undefined ? [] : Array.isArray(values) ? values : [String(values)];

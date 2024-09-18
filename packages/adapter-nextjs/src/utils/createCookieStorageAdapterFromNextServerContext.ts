// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { NextRequest, NextResponse } from 'next/server.js';
import {
	AmplifyServerContextError,
	CookieStorage,
} from '@aws-amplify/core/internals/adapter-core';

import { NextServer } from '../types';

import { ensureEncodedForJSCookie, serializeCookie } from './cookie';

export const DATE_IN_THE_PAST = new Date(0);

export const createCookieStorageAdapterFromNextServerContext = (
	context: NextServer.Context,
): CookieStorage.Adapter => {
	const { request: req, response: res } =
		context as Partial<NextServer.GetServerSidePropsContext>;

	// When the server context is from `getServerSideProps`, the `req` is an instance
	// of IncomingMessage, and the `res` is an instance of ServerResponse.
	// We cannot import these two classes here from `http` as it breaks in Next
	// Edge Runtime. Hence, we check the methods that we need to use for creating
	// cookie adapter.
	if (
		req &&
		res &&
		Object.prototype.toString.call(req.cookies) === '[object Object]' &&
		typeof res.setHeader === 'function'
	) {
		return createCookieStorageAdapterFromGetServerSidePropsContext(req, res);
	}

	const { request, response } = context as Partial<
		| NextServer.NextRequestAndNextResponseContext
		| NextServer.NextRequestAndResponseContext
	>;

	// When the server context is from `middleware`, the `request` is an instance
	// of `NextRequest`.
	// When the server context is from a route handler, the `request` is an `Proxy`
	// wrapped `Request`.
	// The `NextRequest` and the `Proxy` are sharing the same interface by Next
	// implementation. So we don't need to detect the difference.
	if (request && response) {
		if (response instanceof NextResponse) {
			return createCookieStorageAdapterFromNextRequestAndNextResponse(
				request,
				response,
			);
		} else {
			return createCookieStorageAdapterFromNextRequestAndHttpResponse(
				request,
				response,
			);
		}
	}

	const { cookies } = context as Partial<
		NextServer.ServerComponentContext | NextServer.ServerActionContext
	>;

	if (typeof cookies === 'function') {
		return createCookieStorageAdapterFromNextCookies(cookies);
	}

	// This should not happen normally.
	throw new AmplifyServerContextError({
		message:
			'Attempted to create cookie storage adapter from an unsupported Next.js server context.',
	});
};

const createCookieStorageAdapterFromNextRequestAndNextResponse = (
	request: NextRequest,
	response: NextResponse,
): CookieStorage.Adapter => {
	const readonlyCookieStore = request.cookies;
	const mutableCookieStore = response.cookies;

	return {
		get(name) {
			return readonlyCookieStore.get(ensureEncodedForJSCookie(name));
		},
		getAll: readonlyCookieStore.getAll.bind(readonlyCookieStore),
		set(name, value, options) {
			mutableCookieStore.set(ensureEncodedForJSCookie(name), value, options);
		},
		delete(name) {
			mutableCookieStore.delete(ensureEncodedForJSCookie(name));
		},
	};
};

const createCookieStorageAdapterFromNextRequestAndHttpResponse = (
	request: NextRequest,
	response: Response,
): CookieStorage.Adapter => {
	const readonlyCookieStore = request.cookies;
	const mutableCookieStore = createMutableCookieStoreFromHeaders(
		response.headers,
	);

	return {
		get(name) {
			return readonlyCookieStore.get(ensureEncodedForJSCookie(name));
		},
		getAll: readonlyCookieStore.getAll.bind(readonlyCookieStore),
		...mutableCookieStore,
	};
};

const createCookieStorageAdapterFromNextCookies = (
	cookies: NextServer.ServerComponentContext['cookies'],
): CookieStorage.Adapter => {
	const cookieStore = cookies();

	// When Next cookies() is called in a server component, it returns a readonly
	// cookie store. Hence calling set and delete throws an error. However,
	// cookies() returns a mutable cookie store when called in a server action.
	// We have no way to detect which one is returned, so we try to call set and delete
	// and safely ignore the error if it is thrown.
	const setFunc: CookieStorage.Adapter['set'] = (name, value, options) => {
		try {
			cookieStore.set(ensureEncodedForJSCookie(name), value, options);
		} catch {
			// no-op
		}
	};

	const deleteFunc: CookieStorage.Adapter['delete'] = name => {
		try {
			cookieStore.delete(ensureEncodedForJSCookie(name));
		} catch {
			// no-op
		}
	};

	return {
		get(name) {
			return cookieStore.get(ensureEncodedForJSCookie(name));
		},
		getAll: cookieStore.getAll.bind(cookieStore),
		set: setFunc,
		delete: deleteFunc,
	};
};

const createCookieStorageAdapterFromGetServerSidePropsContext = (
	request: NextServer.GetServerSidePropsContext['request'],
	response: NextServer.GetServerSidePropsContext['response'],
): CookieStorage.Adapter => {
	const cookiesMap = { ...request.cookies };
	const allCookies = Object.entries(cookiesMap).map(([name, value]) => ({
		name,
		value,
	}));

	return {
		get(name) {
			const value = cookiesMap[ensureEncodedForJSCookie(name)];

			return value
				? {
						name,
						value,
					}
				: undefined;
		},
		getAll() {
			return allCookies;
		},
		set(name, value, options) {
			const encodedName = ensureEncodedForJSCookie(name);

			const existingValues = getExistingSetCookieValues(
				response.getHeader('Set-Cookie'),
			);

			// if the cookies have already been set, we don't need to set them again.
			if (
				existingValues.findIndex(
					cookieValue =>
						cookieValue.startsWith(`${encodedName}=`) &&
						!cookieValue.startsWith(`${encodedName}=;`),
				) > -1
			) {
				return;
			}

			response.appendHeader(
				'Set-Cookie',
				serializeCookie(encodedName, value, options),
			);
		},
		delete(name) {
			const encodedName = ensureEncodedForJSCookie(name);
			const setCookieValue = `${encodedName}=;Expires=${DATE_IN_THE_PAST.toUTCString()}`;
			const existingValues = getExistingSetCookieValues(
				response.getHeader('Set-Cookie'),
			);

			// if the value for cookie deletion is already in the Set-Cookie header, we
			// don't need to add the deletion value again.
			if (existingValues.includes(setCookieValue)) {
				return;
			}

			response.appendHeader('Set-Cookie', setCookieValue);
		},
	};
};

const createMutableCookieStoreFromHeaders = (
	headers: Headers,
): Pick<CookieStorage.Adapter, 'set' | 'delete'> => {
	const setFunc: CookieStorage.Adapter['set'] = (name, value, options) => {
		headers.append(
			'Set-Cookie',
			serializeCookie(ensureEncodedForJSCookie(name), value, options),
		);
	};
	const deleteFunc: CookieStorage.Adapter['delete'] = name => {
		headers.append(
			'Set-Cookie',
			`${ensureEncodedForJSCookie(
				name,
			)}=;Expires=${DATE_IN_THE_PAST.toUTCString()}`,
		);
	};

	return {
		set: setFunc,
		delete: deleteFunc,
	};
};

const getExistingSetCookieValues = (
	values: number | string | string[] | undefined,
): string[] =>
	values === undefined ? [] : Array.isArray(values) ? values : [String(values)];

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import Cookies, { CookieSetOptions } from 'universal-cookie';
import { browserOrNode } from '../JS';

type Store = Record<string, string>;

const { isBrowser } = browserOrNode();

// Avoid using @types/next because @aws-amplify/ui-angular's version of TypeScript is too old to support it
type Context = { req?: any };

const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;

export class UniversalStorage implements Storage {
	cookies = new Cookies();
	store: Store = isBrowser ? window.localStorage : Object.create(null);

	constructor(context: Context = {}) {
		this.cookies = context.req
			? new Cookies(decodeURIComponent(context.req.headers.cookie))
			: new Cookies();

		Object.assign(this.store, this.cookies.getAll());
	}

	get length() {
		return Object.entries(this.store).length;
	}

	clear() {
		Array.from(new Array(this.length))
			.map((_, i) => this.key(i))
			.forEach(key => this.removeItem(key));
	}

	getItem(key: keyof Store) {
		return this.getLocalItem(key);
	}

	protected getLocalItem(key: keyof Store) {
		return Object.prototype.hasOwnProperty.call(this.store, key)
			? this.store[key]
			: null;
	}

	protected getUniversalItem(key: keyof Store) {
		return this.cookies.get(key);
	}

	key(index: number) {
		return Object.keys(this.store)[index];
	}

	removeItem(key: string) {
		this.removeLocalItem(key);
		this.removeUniversalItem(key);
	}

	protected removeLocalItem(key: keyof Store) {
		delete this.store[key];
	}

	protected removeUniversalItem(key: keyof Store) {
		this.cookies.remove(key, {
			path: '/',
		});
	}

	setItem(key: keyof Store, value: string) {
		this.setLocalItem(key, value);

		// keys take the shape:
		//  1. `${ProviderPrefix}.${userPoolClientId}.${username}.${tokenType}
		//  2. `${ProviderPrefix}.${userPoolClientId}.LastAuthUser
		const tokenType = key.split('.').pop();

		const sessionTokenTypes = [
			'LastAuthUser',
			'accessToken',
			// refreshToken originates on the client, but SSR pages won't fail when this expires
			// Note: the new `accessToken` will also be refreshed on the client (since Amplify doesn't set server-side cookies)
			'refreshToken',
			// Required for CognitoUserSession
			'idToken',
			// userData is used when `Auth.currentAuthenticatedUser({ bypassCache: false })`.
			// Can be persisted to speed up calls to `Auth.currentAuthenticatedUser()`
			// 'userData',

			// Ignoring clockDrift on the server for now, but needs testing
			// 'clockDrift',
		];
		if (sessionTokenTypes.includes(tokenType ?? '')) {
			this.setUniversalItem(key, value, {
				expires: new Date(Date.now() + ONE_YEAR_IN_MS),
			});
		}
	}

	protected setLocalItem(key: keyof Store, value: string) {
		this.store[key] = value;
	}

	protected setUniversalItem(
		key: keyof Store,
		value: string,
		options: CookieSetOptions = {}
	) {
		this.cookies.set(key, value, {
			...options,
			path: '/',
			// `httpOnly` cannot be set via JavaScript: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#JavaScript_access_using_Document.cookie
			sameSite: true,
			// Allow unsecure requests to http://localhost:3000/ when in development.
			secure:
				isBrowser && window.location.hostname === 'localhost' ? false : true,
		});
	}
}

import nookies from 'nookies';

import { browserOrNode } from '../JS';

type Store = Record<string, string>;

const { isBrowser } = browserOrNode();
type Context = Parameters<typeof nookies.get>[0];

export class UniversalStorage implements Storage {
	store: Store = isBrowser ? window.localStorage : Object.create(null);

	constructor(context?: Context) {
		Object.assign(this.store, nookies.get(context));
	}

	get length() {
		return Object.entries(this.store).length;
	}

	clear() {
		Array.from(new Array(this.length))
			.map((value, i) => this.key(i))
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
		const { [key]: value } = isBrowser
			? nookies.get()
			: // @ts-ignore Argument of type 'Record<string, string>' is not assignable to parameter of type 'Pick<any, "req"> | { req: any; }'.
			  // Property 'req' is missing in type 'Record<string, string>' but required in type '{ req: any; }'.ts(2345)
			  nookies.get(this.store);

		return value;
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
		// @ts-ignore Argument of type 'Record<string, string>' is not assignable to parameter of type 'Pick<any, "res"> | { res: any; }'.
		// Property 'res' is missing in type 'Record<string, string>' but required in type '{ res: any; }'.ts(2345)
		nookies.destroy(this.store, key);
	}

	setItem(key: keyof Store, value: string) {
		this.setLocalItem(key, value);

		// keys take the shape:
		//  1. `${ProviderPrefix}.${userPoolClientId}.${username}.${tokenType}
		//  2. `${ProviderPrefix}.${userPoolClientId}.LastAuthUser
		const tokenType = key.split('.').pop();

		switch (tokenType) {
			// LastAuthUser is needed for computing other key names
			case 'LastAuthUser':

			// accessToken is required for CognitoUserSession
			case 'accessToken':

			// Required for CognitoUserSession
			case 'idToken':
				this.setUniversalItem(key, value);

			// userData is used when `Auth.currentAuthenticatedUser({ bypassCache: false })`.
			// Can be persisted to speed up calls to `Auth.currentAuthenticatedUser()`
			// case 'userData':

			// refreshToken isn't shared with the server so that the client handles refreshing
			// case 'refreshToken':

			// Ignoring clockDrift on the server for now, but needs testing
			// case 'clockDrift':
		}
	}

	protected setLocalItem(key: keyof Store, value: string) {
		this.store[key] = value;
	}

	protected setUniversalItem(key: keyof Store, value: string) {
		// @ts-ignore Argument of type 'Record<string, string>' is not assignable to parameter of type 'Pick<any, "res"> | { res: any; }'.
		// Property 'res' is missing in type 'Record<string, string>' but required in type '{ res: any; }'.ts(2345)
		nookies.set(this.store, key, value, {
			path: '/',
			// `httpOnly` cannot be set via JavaScript: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#JavaScript_access_using_Document.cookie
			sameSite: true,
			// Allow unsecure requests to http://localhost:3000/ when in development.
			secure: process.env.NODE_ENV === 'development' ? false : true,
		});
	}
}

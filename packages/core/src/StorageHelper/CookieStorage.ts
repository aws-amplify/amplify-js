// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as Cookies from 'js-cookie';
import { AuthStorage, CookieStorageData, SameSite } from '../types';

export class CookieStorage implements AuthStorage {
	domain: string;
	path: string;
	expires: number;
	secure: boolean;
	sameSite: SameSite;

	constructor(data: CookieStorageData) {
		if (data.domain) {
			this.domain = data.domain;
		}
		if (data.path) {
			this.path = data.path;
		} else {
			this.path = '/';
		}
		if (Object.prototype.hasOwnProperty.call(data, 'expires')) {
			this.expires = data.expires;
		} else {
			this.expires = 365;
		}
		if (Object.prototype.hasOwnProperty.call(data, 'secure')) {
			this.secure = data.secure;
		} else {
			this.secure = true;
		}
		if (Object.prototype.hasOwnProperty.call(data, 'sameSite')) {
			if (!['strict', 'lax', 'none'].includes(data.sameSite)) {
				throw new Error(
					'The sameSite value of cookieStorage must be "lax", "strict" or "none".'
				);
			}
			if (data.sameSite === 'none' && !this.secure) {
				throw new Error(
					'sameSite = None requires the Secure attribute in latest browser versions.'
				);
			}
			this.sameSite = data.sameSite;
		} else {
			this.sameSite = null;
		}
	}

	async setItem(key: string, value: string) {
		const options: CookieStorageData = {
			path: this.path,
			expires: this.expires,
			domain: this.domain,
			secure: this.secure,
		};

		if (this.sameSite) {
			options.sameSite = this.sameSite;
		}

		Cookies.set(key, value, options);
		return Cookies.get(key);
	}

	async getItem(key) {
		return Cookies.get(key);
	}

	async removeItem(key) {
		const options: CookieStorageData = {
			path: this.path,
			expires: this.expires,
			domain: this.domain,
			secure: this.secure,
		};

		if (this.sameSite) {
			options.sameSite = this.sameSite;
		}

		return Cookies.remove(key, options);
	}

	async clear() {
		const cookies = Cookies.get();
		let numKeys = Object.keys(cookies).length;
		for (let index = 0; index < numKeys; ++index) {
			this.removeItem(Object.keys(cookies)[index]);
		}
	}
}

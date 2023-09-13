// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	get as getJsCookie,
	remove as removeJsCookie,
	set as setJsCookie,
} from 'js-cookie';
import {
	CookieStorageData,
	KeyValueStorageInterface,
	SameSite,
} from '../types';

export class CookieStorage implements KeyValueStorageInterface {
	path: string;
	domain?: string;
	expires?: number;
	sameSite?: SameSite;
	secure?: boolean;

	constructor(data: CookieStorageData = {}) {
		const { path, domain, expires, sameSite, secure } = data;
		this.domain = domain;
		this.path = path ? path : '/';
		this.expires = data.hasOwnProperty('expires') ? expires : 365;
		this.secure = data.hasOwnProperty('secure') ? secure : true;

		if (data.hasOwnProperty('sameSite')) {
			if (!sameSite || !['strict', 'lax', 'none'].includes(sameSite)) {
				throw new Error(
					'The sameSite value of cookieStorage must be "lax", "strict" or "none".'
				);
			}
			if (sameSite === 'none' && !this.secure) {
				throw new Error(
					'sameSite = None requires the Secure attribute in latest browser versions.'
				);
			}
			this.sameSite = sameSite;
		}
	}

	async setItem(key: string, value: string) {
		setJsCookie(key, value, this.getData());
	}

	async getItem(key: string) {
		const item = getJsCookie(key);
		return item ?? null;
	}

	async removeItem(key: string) {
		removeJsCookie(key, this.getData());
	}

	async clear() {
		const cookie = getJsCookie();
		const promises = Object.keys(cookie).map(key => this.removeItem(key));
		await Promise.all(promises);
	}

	private getData(): CookieStorageData {
		return {
			path: this.path,
			expires: this.expires,
			domain: this.domain,
			secure: this.secure,
			...(this.sameSite && { sameSite: this.sameSite }),
		};
	}
}

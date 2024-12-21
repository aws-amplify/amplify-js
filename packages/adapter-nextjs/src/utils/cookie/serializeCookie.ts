// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CookieStorage } from 'aws-amplify/adapter-core';

export const serializeCookie = (
	name: string,
	value: string,
	options?: CookieStorage.SetCookieOptions,
): string =>
	`${name}=${value};${options ? serializeSetCookieOptions(options) : ''}`;

const serializeSetCookieOptions = (
	options: CookieStorage.SetCookieOptions,
): string => {
	const { expires, domain, httpOnly, sameSite, secure, path } = options;
	const serializedOptions: string[] = [];
	if (domain) {
		serializedOptions.push(`Domain=${domain}`);
	}
	if (expires) {
		serializedOptions.push(`Expires=${expires.toUTCString()}`);
	}
	if (httpOnly) {
		serializedOptions.push(`HttpOnly`);
	}
	if (sameSite) {
		serializedOptions.push(`SameSite=${sameSite}`);
	}
	if (secure) {
		serializedOptions.push(`Secure`);
	}
	if (path) {
		serializedOptions.push(`Path=${path}`);
	}

	return serializedOptions.join(';');
};

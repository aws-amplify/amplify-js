// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CookieStorage } from 'aws-amplify/adapter-core';

import { serializeCookie } from '../../../src/utils/cookie';

describe('serializeCookie', () => {
	it('should serialize basic cookie without options', () => {
		expect(serializeCookie('name', 'value')).toBe('name=value;');
	});

	it('should encode cookie names for js-cookie compatibility', () => {
		// Test basic encoding
		expect(serializeCookie('simple', 'value')).toBe('simple=value;');
		expect(serializeCookie('cookie-name', 'value')).toBe('cookie-name=value;');
		expect(serializeCookie('cookie_name', 'value')).toBe('cookie_name=value;');

		// Test characters that should be encoded
		expect(serializeCookie('cookie name', 'value')).toBe(
			'cookie%20name=value;',
		);
		expect(serializeCookie('cookie=name', 'value')).toBe(
			'cookie%3Dname=value;',
		);
		expect(serializeCookie('cookie;name', 'value')).toBe(
			'cookie%3Bname=value;',
		);
		expect(serializeCookie('cookie,name', 'value')).toBe(
			'cookie%2Cname=value;',
		);

		// Test characters that js-cookie decodes: %(2[346B]|5E|60|7C)
		// These correspond to: #$&+^`|
		expect(serializeCookie('cookie#name', 'value')).toBe('cookie#name=value;');
		expect(serializeCookie('cookie$name', 'value')).toBe('cookie$name=value;');
		expect(serializeCookie('cookie&name', 'value')).toBe('cookie&name=value;');
		expect(serializeCookie('cookie+name', 'value')).toBe('cookie+name=value;');
		expect(serializeCookie('cookie^name', 'value')).toBe('cookie^name=value;');
		expect(serializeCookie('cookie`name', 'value')).toBe('cookie`name=value;');
		expect(serializeCookie('cookie|name', 'value')).toBe('cookie|name=value;');
	});

	it('should serialize cookie with options', () => {
		const options: CookieStorage.SetCookieOptions = {
			domain: 'example.com',
			sameSite: 'strict',
			path: '/',
			httpOnly: true,
			secure: true,
		};

		expect(serializeCookie('name', 'value', options)).toBe(
			'name=value;Domain=example.com;HttpOnly;SameSite=strict;Secure;Path=/',
		);
	});

	it('should handle complex cookie names with options', () => {
		const options: CookieStorage.SetCookieOptions = {
			domain: 'example.com',
			path: '/',
		};

		expect(serializeCookie('amplify auth token', 'token123', options)).toBe(
			'amplify%20auth%20token=token123;Domain=example.com;Path=/',
		);

		expect(serializeCookie('amplify=auth&token', 'token456', options)).toBe(
			'amplify%3Dauth&token=token456;Domain=example.com;Path=/',
		);
	});

	it('should handle expires option', () => {
		const expires = new Date('2024-12-31T23:59:59.999Z');
		const options: CookieStorage.SetCookieOptions = {
			expires,
		};

		expect(serializeCookie('name', 'value', options)).toBe(
			'name=value;Expires=Tue, 31 Dec 2024 23:59:59 GMT',
		);
	});

	it('should handle maxAge option', () => {
		const options: CookieStorage.SetCookieOptions = {
			maxAge: 3600,
		};

		expect(serializeCookie('name', 'value', options)).toBe(
			'name=value;Max-Age=3600',
		);
	});

	it('should handle all options together', () => {
		const expires = new Date('2024-12-31T23:59:59.999Z');
		const options: CookieStorage.SetCookieOptions = {
			domain: 'example.com',
			expires,
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			path: '/auth',
			maxAge: 7200,
		};

		expect(serializeCookie('auth token', 'abc123', options)).toBe(
			'auth%20token=abc123;Domain=example.com;Expires=Tue, 31 Dec 2024 23:59:59 GMT;HttpOnly;SameSite=lax;Secure;Path=/auth;Max-Age=7200',
		);
	});
});

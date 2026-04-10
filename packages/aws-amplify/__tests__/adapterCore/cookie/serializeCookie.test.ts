// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { serializeCookie } from '../../../src/adapter-core/cookie/serializeCookie';
import { ensureEncodedForJSCookie } from '../../../src/adapter-core/cookie/ensureEncodedForJSCookie';

describe('serializeCookie', () => {
	it('serializes name and value', () => {
		expect(serializeCookie('key', 'val')).toBe('key=val;');
	});

	it('serializes with all options', () => {
		const result = serializeCookie('k', 'v', {
			domain: '.example.com',
			expires: new Date('2025-01-01T00:00:00Z'),
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			path: '/',
			maxAge: 3600,
		});
		expect(result).toContain('Domain=.example.com');
		expect(result).toContain('Expires=');
		expect(result).toContain('HttpOnly');
		expect(result).toContain('SameSite=strict');
		expect(result).toContain('Secure');
		expect(result).toContain('Path=/');
		expect(result).toContain('Max-Age=3600');
	});

	it('omits unset options', () => {
		const result = serializeCookie('k', 'v', { sameSite: 'lax' });
		expect(result).not.toContain('Domain');
		expect(result).not.toContain('HttpOnly');
		expect(result).toContain('SameSite=lax');
	});
});

describe('ensureEncodedForJSCookie', () => {
	it('encodes special characters', () => {
		expect(ensureEncodedForJSCookie('a b')).toBe('a%20b');
	});

	it('passes through simple names', () => {
		expect(ensureEncodedForJSCookie('token')).toBe('token');
	});
});

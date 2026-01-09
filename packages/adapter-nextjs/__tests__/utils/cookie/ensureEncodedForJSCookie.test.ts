// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ensureEncodedForJSCookie } from '../../../src/utils/cookie';

describe('ensureEncodedForJSCookie', () => {
	it('should encode cookie names for js-cookie compatibility', () => {
		// Test basic encoding
		expect(ensureEncodedForJSCookie('simple')).toBe('simple');
		expect(ensureEncodedForJSCookie('cookie-name')).toBe('cookie-name');
		expect(ensureEncodedForJSCookie('cookie_name')).toBe('cookie_name');
	});

	it('should handle special characters that need encoding', () => {
		// Test characters that should be encoded
		expect(ensureEncodedForJSCookie('cookie name')).toBe('cookie%20name');
		expect(ensureEncodedForJSCookie('cookie=name')).toBe('cookie%3Dname');
		expect(ensureEncodedForJSCookie('cookie;name')).toBe('cookie%3Bname');
		expect(ensureEncodedForJSCookie('cookie,name')).toBe('cookie%2Cname');
	});

	it('should decode specific encoded characters per js-cookie behavior', () => {
		// Test characters that js-cookie decodes: %(2[346B]|5E|60|7C)
		// These correspond to: #$&+^`|
		expect(ensureEncodedForJSCookie('cookie#name')).toBe('cookie#name'); // %23 -> #
		expect(ensureEncodedForJSCookie('cookie$name')).toBe('cookie$name'); // %24 -> $
		expect(ensureEncodedForJSCookie('cookie&name')).toBe('cookie&name'); // %26 -> &
		expect(ensureEncodedForJSCookie('cookie+name')).toBe('cookie+name'); // %2B -> +
		expect(ensureEncodedForJSCookie('cookie^name')).toBe('cookie^name'); // %5E -> ^
		expect(ensureEncodedForJSCookie('cookie`name')).toBe('cookie`name'); // %60 -> `
		expect(ensureEncodedForJSCookie('cookie|name')).toBe('cookie|name'); // %7C -> |
	});

	it('should handle complex cookie names with mixed characters', () => {
		// Test realistic auth cookie names that might contain special characters
		expect(ensureEncodedForJSCookie('amplify.auth.token')).toBe(
			'amplify.auth.token',
		);
		expect(ensureEncodedForJSCookie('amplify-auth-token')).toBe(
			'amplify-auth-token',
		);
		expect(ensureEncodedForJSCookie('amplify_auth_token')).toBe(
			'amplify_auth_token',
		);

		// Test with spaces and special chars
		expect(ensureEncodedForJSCookie('amplify auth token')).toBe(
			'amplify%20auth%20token',
		);
		expect(ensureEncodedForJSCookie('amplify=auth&token')).toBe(
			'amplify%3Dauth&token',
		);
	});

	it('should handle empty and edge case inputs', () => {
		expect(ensureEncodedForJSCookie('')).toBe('');
		expect(ensureEncodedForJSCookie('a')).toBe('a');
		expect(ensureEncodedForJSCookie('123')).toBe('123');
	});

	it('should handle Unicode characters', () => {
		expect(ensureEncodedForJSCookie('cookie🍪name')).toBe(
			'cookie%F0%9F%8D%AAname',
		);
		expect(ensureEncodedForJSCookie('cookieñame')).toBe('cookie%C3%B1ame');
	});
});

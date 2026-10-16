// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getOAuthBaseUrl } from '../../../../../src/providers/cognito/utils/oauth/getOAuthBaseUrl';

describe('getOAuthBaseUrl', () => {
	it('prepends https:// when domain has no scheme', () => {
		expect(getOAuthBaseUrl('auth.myapp.com')).toBe('https://auth.myapp.com');
		expect(getOAuthBaseUrl('id.amazoncognito.com')).toBe(
			'https://id.amazoncognito.com',
		);
	});

	it('preserves http:// scheme for local emulators', () => {
		expect(getOAuthBaseUrl('http://localhost:4566')).toBe(
			'http://localhost:4566',
		);
		expect(getOAuthBaseUrl('http://127.0.0.1:9099')).toBe(
			'http://127.0.0.1:9099',
		);
	});

	it('preserves https:// scheme when explicitly provided', () => {
		expect(getOAuthBaseUrl('https://custom-auth.example.com')).toBe(
			'https://custom-auth.example.com',
		);
	});
});

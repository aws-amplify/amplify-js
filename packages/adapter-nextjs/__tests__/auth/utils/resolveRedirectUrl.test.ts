import { OAuthConfig } from '@aws-amplify/core';

import {
	resolveRedirectSignInUrl,
	resolveRedirectSignOutUrl,
} from '../../../src/auth/utils/resolveRedirectUrl';

const oAuthConfig: OAuthConfig = {
	domain: 'example.com',
	redirectSignIn: ['https://example.com/sign-in'],
	redirectSignOut: ['https://example.com/sign-out'],
	responseType: 'code',
	scopes: ['openid', 'email'],
};

describe('resolveRedirectSignInUrl', () => {
	it('returns the redirect url when the redirect url is found by the specified origin', () => {
		const origin = 'https://example.com';
		const result = resolveRedirectSignInUrl(origin, oAuthConfig);

		expect(result).toBe('https://example.com/sign-in');
	});

	it('throws an error when the redirect url is not found by the specified origin', () => {
		const origin = 'https://other-site.com';
		expect(() => resolveRedirectSignInUrl(origin, oAuthConfig)).toThrow(
			'No valid redirectSignIn url found in the OAuth config.',
		);
	});
});

describe('resolveRedirectSignOutUrl', () => {
	it('returns the redirect url when the redirect url is found by the specified origin', () => {
		const origin = 'https://example.com';
		const result = resolveRedirectSignOutUrl(origin, oAuthConfig);

		expect(result).toBe('https://example.com/sign-out');
	});

	it('throws an error when the redirect url is not found by the specified origin', () => {
		const origin = 'https://other-site.com';
		expect(() => resolveRedirectSignOutUrl(origin, oAuthConfig)).toThrow(
			'No valid redirectSignOut url found in the OAuth config.',
		);
	});
});

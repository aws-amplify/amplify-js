import { CookieStorage } from 'aws-amplify/adapter-core';

import { appendSetCookieHeaders } from '../../../src/auth/utils';

describe('appendSetCookieHeaders', () => {
	it('appends Set-Cookie headers to the headers object', () => {
		const headers = new Headers();
		const cookies = [
			{ name: 'cookie1', value: 'value1' },
			{ name: 'cookie2', value: 'value2' },
		];
		const setCookieOptions: CookieStorage.SetCookieOptions = {
			domain: 'example.com',
			sameSite: 'strict',
			path: '/',
		};

		appendSetCookieHeaders(headers, cookies, setCookieOptions);

		expect(headers.get('Set-Cookie')).toEqual(
			[
				'cookie1=value1;Domain=example.com;SameSite=strict;Path=/',
				'cookie2=value2;Domain=example.com;SameSite=strict;Path=/',
			].join(', '),
		);
	});

	it('properly encodes cookie names for js-cookie compatibility', () => {
		const headers = new Headers();
		const cookies = [
			{ name: 'cookie name', value: 'value1' }, // space should be encoded
			{ name: 'cookie=name', value: 'value2' }, // equals should be encoded
			{ name: 'cookie&name', value: 'value3' }, // ampersand should be decoded per js-cookie
		];

		appendSetCookieHeaders(headers, cookies);

		const setCookieHeaders = headers.get('Set-Cookie')?.split(', ') || [];

		expect(setCookieHeaders[0]).toContain('cookie%20name=value1;'); // space encoded
		expect(setCookieHeaders[1]).toContain('cookie%3Dname=value2;'); // equals encoded
		expect(setCookieHeaders[2]).toContain('cookie&name=value3;'); // ampersand decoded
	});

	it('handles complex cookie names with mixed special characters', () => {
		const headers = new Headers();
		const cookies = [
			{ name: 'amplify.auth.token', value: 'token1' },
			{ name: 'amplify auth token', value: 'token2' },
			{ name: 'amplify=auth&token', value: 'token3' },
		];

		appendSetCookieHeaders(headers, cookies);

		const setCookieHeaders = headers.get('Set-Cookie')?.split(', ') || [];

		expect(setCookieHeaders[0]).toContain('amplify.auth.token=token1;');
		expect(setCookieHeaders[1]).toContain('amplify%20auth%20token=token2;');
		expect(setCookieHeaders[2]).toContain('amplify%3Dauth&token=token3;');
	});
});

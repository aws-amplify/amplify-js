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
});

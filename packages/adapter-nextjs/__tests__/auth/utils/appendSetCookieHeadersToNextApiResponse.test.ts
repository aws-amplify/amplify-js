import { CookieStorage } from 'aws-amplify/adapter-core';
import { NextApiResponse } from 'next';

import { appendSetCookieHeadersToNextApiResponse } from '../../../src/auth/utils';

describe('appendSetCookieHeadersToNextApiResponse', () => {
	it('appends Set-Cookie headers to the response.headers object', () => {
		const mockAppendHeader = jest.fn();
		const mockNextApiResponse = {
			appendHeader: mockAppendHeader,
		} as unknown as NextApiResponse;
		const cookies = [
			{ name: 'cookie1', value: 'value1' },
			{ name: 'cookie2', value: 'value2' },
		];
		const setCookieOptions: CookieStorage.SetCookieOptions = {
			domain: 'example.com',
			sameSite: 'strict',
			path: '/',
		};

		appendSetCookieHeadersToNextApiResponse(
			mockNextApiResponse,
			cookies,
			setCookieOptions,
		);

		expect(mockAppendHeader).toHaveBeenCalledTimes(2);
		expect(mockAppendHeader).toHaveBeenNthCalledWith(
			1,
			'Set-Cookie',
			'cookie1=value1;Domain=example.com;SameSite=strict;Path=/',
		);
		expect(mockAppendHeader).toHaveBeenNthCalledWith(
			2,
			'Set-Cookie',
			'cookie2=value2;Domain=example.com;SameSite=strict;Path=/',
		);
	});
});

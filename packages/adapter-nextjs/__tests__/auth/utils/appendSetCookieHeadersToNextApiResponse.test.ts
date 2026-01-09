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

	it('properly encodes cookie names for js-cookie compatibility', () => {
		const mockAppendHeader = jest.fn();
		const mockNextApiResponse = {
			appendHeader: mockAppendHeader,
		} as unknown as NextApiResponse;
		const cookies = [
			{ name: 'cookie name', value: 'value1' }, // space should be encoded
			{ name: 'cookie=name', value: 'value2' }, // equals should be encoded
			{ name: 'cookie&name', value: 'value3' }, // ampersand should be decoded per js-cookie
		];

		appendSetCookieHeadersToNextApiResponse(mockNextApiResponse, cookies);

		expect(mockAppendHeader).toHaveBeenCalledTimes(3);
		expect(mockAppendHeader).toHaveBeenNthCalledWith(
			1,
			'Set-Cookie',
			'cookie%20name=value1;', // space encoded
		);
		expect(mockAppendHeader).toHaveBeenNthCalledWith(
			2,
			'Set-Cookie',
			'cookie%3Dname=value2;', // equals encoded
		);
		expect(mockAppendHeader).toHaveBeenNthCalledWith(
			3,
			'Set-Cookie',
			'cookie&name=value3;', // ampersand decoded per js-cookie behavior
		);
	});

	it('handles complex cookie names with mixed special characters', () => {
		const mockAppendHeader = jest.fn();
		const mockNextApiResponse = {
			appendHeader: mockAppendHeader,
		} as unknown as NextApiResponse;
		const cookies = [
			{ name: 'amplify.auth.token', value: 'token1' },
			{ name: 'amplify auth token', value: 'token2' },
			{ name: 'amplify=auth&token', value: 'token3' },
		];

		appendSetCookieHeadersToNextApiResponse(mockNextApiResponse, cookies);

		expect(mockAppendHeader).toHaveBeenCalledTimes(3);
		expect(mockAppendHeader).toHaveBeenNthCalledWith(
			1,
			'Set-Cookie',
			'amplify.auth.token=token1;',
		);
		expect(mockAppendHeader).toHaveBeenNthCalledWith(
			2,
			'Set-Cookie',
			'amplify%20auth%20token=token2;',
		);
		expect(mockAppendHeader).toHaveBeenNthCalledWith(
			3,
			'Set-Cookie',
			'amplify%3Dauth&token=token3;',
		);
	});
});

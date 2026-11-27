import { NextApiRequest } from 'next';

import { getCookieValuesFromNextApiRequest } from '../../../src/auth/utils';

describe('getCookieValuesFromNextApiRequest', () => {
	it('returns cookie values from the request', () => {
		const mockRequest = {
			cookies: {
				cookie1: 'value1',
			},
		} as unknown as NextApiRequest;

		const result = getCookieValuesFromNextApiRequest(mockRequest, [
			'cookie1',
			'non-exist-cookie',
		]);

		expect(result).toEqual(
			expect.objectContaining({
				cookie1: 'value1',
				'non-exist-cookie': undefined,
			}),
		);
	});

	it('matches cookies whose names are percent-encoded on the wire', () => {
		// Next.js decodes cookie values in `request.cookies` but keeps the
		// names as they appear on the wire
		const mockRequest = {
			cookies: {
				'CognitoIdentityServiceProvider.clientId.%E7%94%A8%E6%88%B7.refreshToken':
					'token-value',
				'CognitoIdentityServiceProvider.clientId.test%40example.com.refreshToken':
					'token-value-2',
			},
		} as unknown as NextApiRequest;

		const result = getCookieValuesFromNextApiRequest(mockRequest, [
			'CognitoIdentityServiceProvider.clientId.用户.refreshToken',
			'CognitoIdentityServiceProvider.clientId.test@example.com.refreshToken',
		]);

		expect(result).toEqual({
			'CognitoIdentityServiceProvider.clientId.用户.refreshToken':
				'token-value',
			'CognitoIdentityServiceProvider.clientId.test@example.com.refreshToken':
				'token-value-2',
		});
	});
});

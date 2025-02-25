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
});

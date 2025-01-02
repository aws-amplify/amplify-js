import { getCookieValuesFromRequest } from '../../../src/auth/utils';

describe('getCookieValuesFromRequest', () => {
	it('returns cookie values from the request', () => {
		const mockHeadersGet = jest
			.fn()
			.mockReturnValue('cookie1=value1; cookie2=value2');
		const mockRequest = {
			headers: {
				get: mockHeadersGet,
			},
		} as unknown as Request;

		const result = getCookieValuesFromRequest(mockRequest, [
			'cookie1',
			'cookie2',
			'non-exist-cookie',
		]);

		expect(result).toEqual(
			expect.objectContaining({
				cookie1: 'value1',
				cookie2: 'value2',
				'non-exist-cookie': undefined,
			}),
		);

		expect(mockHeadersGet).toHaveBeenCalledWith('Cookie');
	});

	it('returns empty object when cookie header is not present', () => {
		const mockHeadersGet = jest.fn().mockReturnValue(null);
		const mockRequest = {
			headers: {
				get: mockHeadersGet,
			},
		} as unknown as Request;

		const result = getCookieValuesFromRequest(mockRequest, ['cookie1']);

		expect(result).toEqual({});
		expect(mockHeadersGet).toHaveBeenCalledWith('Cookie');
	});
});

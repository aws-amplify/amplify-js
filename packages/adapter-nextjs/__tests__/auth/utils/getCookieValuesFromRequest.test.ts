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

	it('matches cookies whose names are percent-encoded on the wire (e.g. usernames containing `@`)', () => {
		// Cookie name on the wire is percent-encoded by the write path, so a
		// lookup key using the raw (unencoded) name must still resolve.
		const mockHeadersGet = jest
			.fn()
			.mockReturnValue(
				'CognitoIdentityServiceProvider.clientId.test%40example.com.refreshToken=token-value',
			);
		const mockRequest = {
			headers: { get: mockHeadersGet },
		} as unknown as Request;

		const result = getCookieValuesFromRequest(mockRequest, [
			'CognitoIdentityServiceProvider.clientId.test@example.com.refreshToken',
		]);

		expect(result).toEqual({
			'CognitoIdentityServiceProvider.clientId.test@example.com.refreshToken':
				'token-value',
		});
	});
});

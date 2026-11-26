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

	it('decodes percent-encoded cookie values', () => {
		const mockRequest = {
			headers: {
				get: jest
					.fn()
					.mockReturnValue(
						`LastAuthUser=${encodeURIComponent('用户')}; other=${encodeURIComponent('josé✓')}`,
					),
			},
		} as unknown as Request;

		expect(
			getCookieValuesFromRequest(mockRequest, ['LastAuthUser', 'other']),
		).toEqual({ LastAuthUser: '用户', other: 'josé✓' });
	});

	it('returns legacy unencoded and malformed values as-is', () => {
		const mockRequest = {
			headers: {
				get: jest
					.fn()
					.mockReturnValue('legacy=José; malformed=100%; partial=%E4%B8'),
			},
		} as unknown as Request;

		expect(
			getCookieValuesFromRequest(mockRequest, [
				'legacy',
				'malformed',
				'partial',
			]),
		).toEqual({ legacy: 'José', malformed: '100%', partial: '%E4%B8' });
	});

	it('keeps the rest of a value that contains a raw `=`', () => {
		const mockRequest = {
			headers: {
				get: jest.fn().mockReturnValue('legacy=a=b=c; other=value'),
			},
		} as unknown as Request;

		expect(
			getCookieValuesFromRequest(mockRequest, ['legacy', 'other']),
		).toEqual({ legacy: 'a=b=c', other: 'value' });
	});
});

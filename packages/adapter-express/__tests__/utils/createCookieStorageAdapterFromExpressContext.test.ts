// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	DATE_IN_THE_PAST,
	createCookieStorageAdapterFromExpressContext,
} from '../../src/utils/createCookieStorageAdapterFromExpressContext';

describe('createCookieStorageAdapterFromExpressContext', () => {
	const createMockContext = (cookies: Record<string, string> = {}) => ({
		request: { cookies } as any,
		response: {
			setHeader: jest.fn(),
			getHeader: jest.fn().mockReturnValue(undefined),
			appendHeader: jest.fn(),
		} as any,
	});

	it('throws when context is invalid', () => {
		expect(() =>
			createCookieStorageAdapterFromExpressContext({
				request: null,
				response: null,
			} as any),
		).toThrow('unsupported Express.js server context');
	});

	it('get() returns a cookie by name', () => {
		const ctx = createMockContext({ token: 'abc' });
		const adapter = createCookieStorageAdapterFromExpressContext(ctx);

		expect(adapter.get('token')).toEqual({ name: 'token', value: 'abc' });
		expect(adapter.get('missing')).toBeUndefined();
	});

	it('getAll() returns all cookies', () => {
		const ctx = createMockContext({ a: '1', b: '2' });
		const adapter = createCookieStorageAdapterFromExpressContext(ctx);

		expect(adapter.getAll()).toEqual([
			{ name: 'a', value: '1' },
			{ name: 'b', value: '2' },
		]);
	});

	it('set() appends a Set-Cookie header', () => {
		const ctx = createMockContext();
		const adapter = createCookieStorageAdapterFromExpressContext(ctx);

		adapter.set('token', 'val');
		expect(ctx.response.appendHeader).toHaveBeenCalledWith(
			'Set-Cookie',
			expect.stringContaining('token=val'),
		);
	});

	it('set() skips if cookie already set', () => {
		const ctx = createMockContext();
		ctx.response.getHeader.mockReturnValue(['token=val']);
		const adapter = createCookieStorageAdapterFromExpressContext(ctx);

		adapter.set('token', 'new');
		expect(ctx.response.appendHeader).not.toHaveBeenCalled();
	});

	it('delete() appends an expired Set-Cookie header', () => {
		const ctx = createMockContext();
		const adapter = createCookieStorageAdapterFromExpressContext(ctx);

		adapter.delete('token');
		expect(ctx.response.appendHeader).toHaveBeenCalledWith(
			'Set-Cookie',
			`token=;Expires=${DATE_IN_THE_PAST.toUTCString()}`,
		);
	});
});

import { NextRequest } from 'next/server.js';

import {
	isAuthRoutesHandlersContext,
	isNextApiRequest,
	isNextApiResponse,
	isNextRequest,
} from '../../../src/auth/utils/predicates';

describe('isAuthRoutesHandlersContext', () => {
	test.each([
		[{}, false],
		[{ params: {} }, true],
		[{ params: { slug: 'sign-in' } }, true],
		[{ params: Promise.resolve({ slug: 'sign-in' }) }, true],
	] as [object, boolean][])(
		'when call with %o it returns %s',
		(input, expectedResult) => {
			expect(isAuthRoutesHandlersContext(input)).toBe(expectedResult);
		},
	);
});

describe('isNextApiRequest', () => {
	it('returns true when the request object has a query property', () => {
		expect(isNextApiRequest({ query: {} })).toBe(true);
	});
});

describe('isNextApiResponse', () => {
	it('returns true when the response object has a redirect method', () => {
		expect(isNextApiResponse({ redirect: jest.fn() })).toBe(true);
	});
});

describe('isNextRequest', () => {
	it('returns true when the request object is an instance of Request and has a nextUrl property', () => {
		const request = new NextRequest(new URL('https://example.com'));

		expect(isNextRequest(request)).toBe(true);
	});

	it('returns true when the request is like a next request', () => {
		const mockNextRequest = {
			nextUrl: {
				pathname: '/api/auth',
				search: '?param=value',
				searchParams: new URLSearchParams('param=value'),
				href: 'https://example.com/api/auth?param=value',
			},
			cookies: {
				get: jest.fn(),
				set: jest.fn(),
				delete: jest.fn(),
			},
			url: 'https://example.com/api/auth?param=value',
			headers: new Headers({
				'content-type': 'application/json',
				'user-agent': 'test-agent',
			}),
			method: 'POST',
			body: null,
			bodyUsed: false,
		};

		expect(isNextRequest(mockNextRequest)).toBe(true);
	});

	it('returns false for regular Request objects without NextRequest properties', () => {
		const regularRequest = {
			headers: new Headers(),
			method: 'GET',
			url: 'https://example.com',
		};

		expect(isNextRequest(regularRequest)).toBe(false);
	});

	it('returns false for objects with nextUrl but missing other required properties', () => {
		const incompleteObject = {
			nextUrl: {
				pathname: '/test',
				search: '',
			},
		};

		expect(isNextRequest(incompleteObject)).toBe(false);
	});

	it('returns false for objects with malformed nextUrl', () => {
		const malformedNextUrl = {
			nextUrl: 'not-an-object',
			cookies: {},
			headers: new Headers(),
			method: 'GET',
			url: 'https://example.com',
		};

		expect(isNextRequest(malformedNextUrl)).toBe(false);
	});

	it('returns false for objects with null nextUrl', () => {
		const nullNextUrl = {
			nextUrl: null,
			cookies: {},
			headers: new Headers(),
			method: 'GET',
			url: 'https://example.com',
		};

		expect(isNextRequest(nullNextUrl)).toBe(false);
	});

	it('returns false for objects missing cookies property', () => {
		const missingCookies = {
			nextUrl: {
				pathname: '/test',
				search: '',
			},
			headers: new Headers(),
			method: 'GET',
			url: 'https://example.com',
		};

		expect(isNextRequest(missingCookies)).toBe(false);
	});

	it('returns false for objects with non-string method', () => {
		const invalidMethod = {
			nextUrl: {
				pathname: '/test',
				search: '',
			},
			cookies: {},
			headers: new Headers(),
			method: 123,
			url: 'https://example.com',
		};

		expect(isNextRequest(invalidMethod)).toBe(false);
	});

	it('returns false for objects with non-string url', () => {
		const invalidUrl = {
			nextUrl: {
				pathname: '/test',
				search: '',
			},
			cookies: {},
			headers: new Headers(),
			method: 'GET',
			url: 123,
		};

		expect(isNextRequest(invalidUrl)).toBe(false);
	});

	it('returns false for null or undefined inputs', () => {
		expect(isNextRequest(null as any)).toBe(false);
		expect(isNextRequest(undefined as any)).toBe(false);
	});
});

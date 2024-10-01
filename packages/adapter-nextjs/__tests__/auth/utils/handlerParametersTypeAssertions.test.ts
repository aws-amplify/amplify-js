/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server.js';

import {
	isAuthRoutesHandlersContext,
	isNextApiRequest,
	isNextApiResponse,
	isNextRequest,
} from '../../../src/auth/utils/handlerParametersTypeAssertions';

describe('isAuthRoutesHandlersContext', () => {
	test.each([
		[{}, false],
		[
			{
				params: {},
			},
			false,
		],
		[
			{
				params: {
					slug: 'sign-in',
				},
			},
			true,
		],
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
});

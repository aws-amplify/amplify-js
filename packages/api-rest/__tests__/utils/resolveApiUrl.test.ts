import type { AmplifyClassV6 } from '@aws-amplify/core';

import { resolveApiUrl } from '../../src/utils';
import {
	RestApiError,
	RestApiValidationErrorCode,
	validationErrorMap,
} from '../../src/errors';

const mkAmplify = (endpoint = 'https://example.com/api', apiName = 'myAPI') =>
	({
		getConfig: () => ({
			API: {
				REST: {
					[apiName]: {
						endpoint,
					},
				},
			},
		}),
	}) as unknown as AmplifyClassV6;

describe('resolveApiUrl', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it.each([
		{
			test: "parse absolute URL's",
			amplify: mkAmplify(),
			expected: 'https://example.com/api/rest',
			succeeds: true,
		},
		{
			test: "parse relative URL's",
			amplify: mkAmplify('/api'),
			expected: 'http://localhost/api/rest',
			succeeds: true,
		},
		{
			test: "parse URL's without protocol",
			amplify: mkAmplify('//foo.bar.com/api'),
			expected: 'http://foo.bar.com/api/rest',
			succeeds: true,
		},
		{
			test: 'fail validation with empty endpoint',
			amplify: mkAmplify(''),
			expected: 'Check if the API name matches the one in your configuration',
			succeeds: false,
		},
		{
			test: 'fail validation with non-existent api',
			amplify: mkAmplify('https://example.com/api', 'otherAPI'),
			expected: 'Check if the API name matches the one in your configuration',
			succeeds: false,
		},
	])(`should $test`, ({ expected, amplify, succeeds }) => {
		if (succeeds) {
			expect.assertions(1);
			const url = resolveApiUrl(amplify, 'myAPI', '/rest');
			expect(url.toString()).toEqual(expected);
		} else {
			expect.assertions(2);
			try {
				resolveApiUrl(amplify, 'myAPI', '/rest');
			} catch (error) {
				expect(error).toBeInstanceOf(RestApiError);
				expect(error).toMatchObject({
					...validationErrorMap[RestApiValidationErrorCode.InvalidApiName],
					recoverySuggestion: expect.stringContaining(expected),
				});
			}
		}
	});

	it('appends query parameters', () => {
		const url = resolveApiUrl(mkAmplify(), 'myAPI', '/rest', {
			foo: 'bar',
			baz: '1',
		});
		expect(url.toString()).toEqual(
			'https://example.com/api/rest?foo=bar&baz=1',
		);
	});

	it('overrides query parameters', () => {
		const url = resolveApiUrl(mkAmplify(), 'myAPI', '/rest?baz=1', {
			foo: 'bar',
			baz: '2',
		});
		expect(url.toString()).toEqual(
			'https://example.com/api/rest?baz=2&foo=bar',
		);
	});
});

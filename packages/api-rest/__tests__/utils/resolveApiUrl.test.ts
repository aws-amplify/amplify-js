import { createMockAmplifyContext } from '../testUtils/mockAmplifyContext';
import { resolveApiUrl } from '../../src/utils';
import {
	RestApiError,
	RestApiValidationErrorCode,
	validationErrorMap,
} from '../../src/errors';

const mkCtx = (endpoint = 'https://example.com/api', apiName = 'myAPI') =>
	createMockAmplifyContext({
		API: {
			REST: {
				[apiName]: { endpoint },
			},
		},
	});

describe('resolveApiUrl', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	it.each([
		{
			test: "parse absolute URL's",
			ctx: mkCtx(),
			expected: 'https://example.com/api/rest',
			succeeds: true,
		},
		{
			test: "parse relative URL's",
			ctx: mkCtx('/api'),
			expected: 'http://localhost/api/rest',
			succeeds: true,
		},
		{
			test: "parse URL's without protocol",
			ctx: mkCtx('//foo.bar.com/api'),
			expected: 'http://foo.bar.com/api/rest',
			succeeds: true,
		},
		{
			test: 'fail validation with empty endpoint',
			ctx: mkCtx(''),
			expected: 'Check if the API name matches the one in your configuration',
			succeeds: false,
		},
		{
			test: 'fail validation with non-existent api',
			ctx: mkCtx('https://example.com/api', 'otherAPI'),
			expected: 'Check if the API name matches the one in your configuration',
			succeeds: false,
		},
	])(`should $test`, ({ expected, ctx, succeeds }) => {
		if (succeeds) {
			expect.assertions(1);
			const url = resolveApiUrl(ctx, 'myAPI', '/rest');
			expect(url.toString()).toEqual(expected);
		} else {
			expect.assertions(2);
			try {
				resolveApiUrl(ctx, 'myAPI', '/rest');
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
		const url = resolveApiUrl(mkCtx(), 'myAPI', '/rest', {
			foo: 'bar',
			baz: '1',
		});
		expect(url.toString()).toEqual(
			'https://example.com/api/rest?foo=bar&baz=1',
		);
	});

	it('overrides query parameters', () => {
		const url = resolveApiUrl(mkCtx(), 'myAPI', '/rest?baz=1', {
			foo: 'bar',
			baz: '2',
		});
		expect(url.toString()).toEqual(
			'https://example.com/api/rest?baz=2&foo=bar',
		);
	});
});

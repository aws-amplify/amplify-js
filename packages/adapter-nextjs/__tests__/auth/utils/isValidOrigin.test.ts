import {
	isNonSSLOrigin,
	isValidOrigin,
} from '../../../src/auth/utils/isValidOrigin';

describe('isValidOrigin', () => {
	test.each([
		// Valid origins
		['http://example.com', true],
		['https://example.com', true],
		['http://www.example.com', true],
		['https://subdomain.example.com', true],
		['http://example.com:8080', true],
		['https://example.com:443', true],
		['http://localhost', true],
		['http://localhost:3000', true],
		['https://localhost:8080', true],
		['http://127.0.0.1', true],
		['http://127.0.0.1:8000', true],

		// Invalid origins
		['http://example.com/path', false],
		['https://example.com/path/to/resource', false],
		['http://example.com:8080/path', false],
		['ftp://example.com', false],
		['example.com', false],
		['http:/example.com', false],
		['https:example.com', false],
		['http://', false],
		['https://', false],
		['localhost', false],
		['http:localhost', false],
		['https://localhost:', false],
		['http://127.0.0.1:', false],
		['https://.com', false],
		['http://example.', false],
		['https://example.com:abc', false],
		['http:// example.com', false],
		['https://exam ple.com', false],
		['http://exa mple.com:8080', false],
		['https://example.com:8080:8081', false],
		['http://example.com:80:80', false],
		['https://.example.com', false],
		['http://example..com', false],
		['https://exam_ple.com', false],
		['https://example.com?query=param', false],
		['https://example.com:80/path#fragment', false],
	] as [string, boolean][])('validates origin %s as %s', (origin, expected) => {
		expect(isValidOrigin(origin)).toBe(expected);
	});
});

describe('isNonSSLLocalhostOrigin', () => {
	test.each([
		['http://localhost', true],
		['http://localhost:3000', true],
		['https://some-app.com', false],
	])('check origin is non-SSL localhost %s as %s', (origin, expected) => {
		expect(isNonSSLOrigin(origin)).toBe(expected);
	});
});

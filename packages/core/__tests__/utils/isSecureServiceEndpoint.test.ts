import { isSecureServiceEndpoint } from '../../src/utils/isSecureServiceEndpoint';

describe('isSecureServiceEndpoint', () => {
	const a = isSecureServiceEndpoint;

	test.each([
		['not-a-url', false],
		['http://example.com', false],
		['https://example.com', true],
		['http://localhost:3000', true],
		['http://127.0.0.1:3000', true],
	])('isSecureServiceEndpoint(%s) returns %s', (input, expected) => {
		expect(a(input)).toBe(expected);
	});
});

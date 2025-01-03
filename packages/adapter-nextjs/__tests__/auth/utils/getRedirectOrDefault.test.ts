import { getRedirectOrDefault } from '../../../src/auth/utils/getRedirectOrDefault';

describe('getRedirectOrDefault', () => {
	test.each([
		[undefined, '/'],
		['', '/'],
		['/home', '/home'],
	])('when input redirect is `%s` returns `%s`', (input, output) => {
		expect(getRedirectOrDefault(input)).toBe(output);
	});
});

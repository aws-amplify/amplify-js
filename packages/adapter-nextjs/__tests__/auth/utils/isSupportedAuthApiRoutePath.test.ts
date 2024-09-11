import { isSupportedAuthApiRoutePath } from '../../../src/auth/utils/isSupportedAuthApiRoutePath';

describe('isSupportedAuthApiRoutePath', () => {
	test.each([
		['sign-in', true],
		['sign-in-callback', true],
		['sign-up', true],
		['sign-out', true],
		['sign-out-callback', true],
		['fancy-route', false],
	])('when call with %s it returns %s', (input, expectedResult) => {
		expect(isSupportedAuthApiRoutePath(input)).toBe(expectedResult);
	});
});

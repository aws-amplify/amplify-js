import { resolveIdentityProviderFromUrl } from '../../../src/auth/utils/resolveIdentityProviderFromUrl';

describe('resolveIdentityProviderFromUrl', () => {
	test.each([
		['https://example.com?provider=Google', 'Google'],
		['https://example.com?provider=Facebook', 'Facebook'],
		['https://example.com?provider=Amazon', 'LoginWithAmazon'],
		['https://example.com?provider=Apple', 'SignInWithApple'],
		['https://example.com?provider=google', 'Google'],
		['https://example.com?provider=facebook', 'Facebook'],
		['https://example.com?provider=amazon', 'LoginWithAmazon'],
		['https://example.com?provider=apple', 'SignInWithApple'],
		['https://example.com?provider=unknown', 'unknown'],
		['https://example.com', null],
		['https://example.com?provider=', null],
		['https://example.com?provider=Google&other=param', 'Google'],
	])('when the url is %s it returns %s', (input, expectedResult) => {
		const result = resolveIdentityProviderFromUrl(input);

		expect(result).toBe(expectedResult);
	});
});

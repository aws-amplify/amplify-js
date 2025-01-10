import { parseSignInCallbackUrl } from '../../../src/auth/utils/parseSignInCallbackUrl';

describe('parseSignInCallbackUrl', () => {
	it('returns the code and state from the url', () => {
		const url =
			'https://example.com?code=123&state=456&error=789&error_description=abc';
		const result = parseSignInCallbackUrl(url);

		expect(result).toEqual({
			code: '123',
			state: '456',
			error: '789',
			errorDescription: 'abc',
		});
	});
});

import { resolveCodeAndStateFromUrl } from '../../../src/auth/utils/resolveCodeAndStateFromUrl';

describe('resolveCodeAndStateFromUrl', () => {
	it('returns the code and state from the url', () => {
		const url = 'https://example.com?code=123&state=456';
		const result = resolveCodeAndStateFromUrl(url);

		expect(result).toEqual({
			code: '123',
			state: '456',
		});
	});
});

import { createOnSignInCompletedRedirectIntermediate } from '../../../src/auth/utils/createOnSignInCompletedRedirectIntermediate';

describe('createOnSignInCompletedRedirectIntermediate', () => {
	it('returns html with script that redirects to the redirectUrl', () => {
		const redirectUrl = 'https://example.com';
		const result = createOnSignInCompletedRedirectIntermediate({
			redirectOnSignInComplete: redirectUrl,
		});

		expect(result).toMatchSnapshot();
	});
});

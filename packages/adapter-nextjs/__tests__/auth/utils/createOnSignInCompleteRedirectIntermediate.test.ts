import { createOnSignInCompleteRedirectIntermediate } from '../../../src/auth/utils/createOnSignInCompleteRedirectIntermediate';

describe('createOnSignInCompletedRedirectIntermediate', () => {
	it('returns html with script that redirects to the redirectUrl', () => {
		const redirectUrl = 'https://example.com';
		const result = createOnSignInCompleteRedirectIntermediate({
			redirectOnSignInComplete: redirectUrl,
		});

		expect(result).toMatchSnapshot();
	});
});

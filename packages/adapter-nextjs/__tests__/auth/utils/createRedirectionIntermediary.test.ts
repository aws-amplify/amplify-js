import { createRedirectionIntermediary } from '../../../src/auth/utils/createRedirectionIntermediary';

describe('createOnSignInCompletedRedirectIntermediate', () => {
	it('returns html with script that redirects to the redirectUrl', () => {
		const redirectUrl = 'https://example.com';
		const result = createRedirectionIntermediary({
			redirectTo: redirectUrl,
		});

		expect(result).toMatchSnapshot();
	});
});

import { AuthClass } from '../../../src/singleton/Auth';
import { isSecureServiceEndpoint } from '../../../src/utils';

jest.mock('../../../src/utils');

const mockIsSecureServiceEndpoint = jest.mocked(isSecureServiceEndpoint);

describe('Auth', () => {
	const auth = new AuthClass();

	const mockConfig = {
		userPoolClientId: 'userPoolClientId',
		userPoolId: 'userPoolId',
		identityPoolId: 'identityPoolId',
	};

	const expectedErrorMatcher = /must use HTTPS protocol\.$/;

	afterEach(() => {
		mockIsSecureServiceEndpoint.mockClear();
	});

	describe('configure', () => {
		it('throws when custom user pool endpoint is not secure', () => {
			const nonSecureUserPoolEndpoint = 'http://example.com';
			mockIsSecureServiceEndpoint.mockReturnValueOnce(false);

			expect(() => {
				auth.configure({
					Cognito: {
						...mockConfig,
						userPoolEndpoint: nonSecureUserPoolEndpoint,
					},
				});
			}).toThrow(expectedErrorMatcher);
			expect(mockIsSecureServiceEndpoint).toHaveBeenCalledWith(
				nonSecureUserPoolEndpoint,
			);
		});

		it('throws when custom identity pool endpoint is not secure', () => {
			const nonSecureIdentityPoolEndpoint = 'http://example.com';
			mockIsSecureServiceEndpoint.mockReturnValueOnce(true); // good user pool endpoint
			mockIsSecureServiceEndpoint.mockReturnValueOnce(false); // bad identity pool endpoint

			expect(() => {
				auth.configure({
					Cognito: {
						...mockConfig,
						userPoolEndpoint: 'https://example.com',
						identityPoolEndpoint: nonSecureIdentityPoolEndpoint,
					},
				});
			}).toThrow(expectedErrorMatcher);
			expect(mockIsSecureServiceEndpoint).toHaveBeenCalledWith(
				nonSecureIdentityPoolEndpoint,
			);
		});
	});
});

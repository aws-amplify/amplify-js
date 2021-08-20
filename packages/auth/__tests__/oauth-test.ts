import OAuth from '../src/OAuth/OAuth';

jest.mock('../src/OAuth/oauthStorage', () => {
	return {
		setState: jest.fn(),
		getState: jest.fn(),
		setPKCE: jest.fn(),
		getPKCE: jest.fn(),
	};
});

jest.mock('../src/OAuth/urlOpener', () => {
	return {
		launchUri: jest.fn(),
	};
});

jest.mock('@aws-amplify/core', () => ({
	ConsoleLogger: () => ({
		debug: jest.fn(),
		error: jest.fn(),
	}),
	Hub: {
		dispatch: jest.fn(),
	},
	urlSafeEncode: jest.fn(),
}));

function fetchMockReturn(response) {
	const globalMock = global as any;
	globalMock.fetch = jest.fn();
	globalMock.fetch.mockResolvedValueOnce({
		json: () => response,
	});
}

describe('OAuth', () => {
	describe('handleAuthResponse', () => {
		test('nothing happens for the code flow when the code query parameter is not specified', async () => {
			const currentUrl = 'https://test.com';
			const config = {
				domain: '',
				clientID: '',
				scope: '',
				redirectUri: '',
				audience: '',
				responseType: 'code',
				returnTo: '',
				redirectSignIn: currentUrl,
			};
			const oAuth = new OAuth({
				scopes: [],
				config,
				cognitoClientId: '',
			});

			const handleResponse = await oAuth.handleAuthResponse(currentUrl);
			expect(handleResponse).toEqual({ state: undefined });
		});
		test('accessToken, refreshToken, and idToken for the code flow are returned when the code query parameter is specified', async () => {
			const currentUrl = 'https://test.com';
			const config = {
				domain: '',
				clientID: '',
				scope: '',
				redirectUri: '',
				audience: '',
				responseType: 'code',
				returnTo: '',
				redirectSignIn: currentUrl,
			};
			const oAuth = new OAuth({
				scopes: [],
				config,
				cognitoClientId: '',
			});
			const mockAccessToken = 'mockAccessToken';
			const mockRefreshToken = 'mockRefreshToken';
			const mockIdToken = 'mockIdToken';

			fetchMockReturn({
				access_token: mockAccessToken,
				refresh_token: mockRefreshToken,
				id_token: mockIdToken,
			});

			const handleResponse = await oAuth.handleAuthResponse(
				`${currentUrl}?code=12345`
			);
			expect(handleResponse).toEqual({
				state: undefined,
				accessToken: mockAccessToken,
				refreshToken: mockRefreshToken,
				idToken: mockIdToken,
			});
		});
		test('nothing happens for the code flow when the current URL is different than the redirect URL', async () => {
			const config = {
				domain: '',
				clientID: '',
				scope: '',
				redirectUri: '',
				audience: '',
				responseType: 'code',
				returnTo: '',
				redirectSignIn: 'https://test.com',
			};
			const oAuth = new OAuth({
				scopes: [],
				config,
				cognitoClientId: '',
			});

			const handleResponse = await oAuth.handleAuthResponse(
				'https://test2.com'
			);
			expect(handleResponse).toEqual({ state: undefined });
		});
		test('an error is thrown for the code flow when there is an error calling the token endpoint', async () => {
			const currentUrl = 'https://test.com';
			const config = {
				domain: '',
				clientID: '',
				scope: '',
				redirectUri: '',
				audience: '',
				responseType: 'code',
				returnTo: '',
				redirectSignIn: currentUrl,
			};
			const oAuth = new OAuth({
				scopes: [],
				config,
				cognitoClientId: '',
			});
			const mockError = 'mock error';
			fetchMockReturn({
				error: mockError,
			});

			try {
				await oAuth.handleAuthResponse(`${currentUrl}?code=12345`);
				fail('error not thrown');
			} catch (err) {
				expect(err.message).toBe(mockError);
			}
		});
		test('Tokens are returned when the currentUrl has three slashes', async () => {
			const redirectSignIn = 'myapp://';
			const currentUrl = 'myapp:///';

			const config = {
				domain: '',
				clientID: '',
				scope: '',
				redirectUri: '',
				audience: '',
				responseType: 'code',
				returnTo: '',
				redirectSignIn,
			};
			const oAuth = new OAuth({
				scopes: [],
				config,
				cognitoClientId: '',
			});
			const mockAccessToken = 'mockAccessToken';
			const mockRefreshToken = 'mockRefreshToken';
			const mockIdToken = 'mockIdToken';

			fetchMockReturn({
				access_token: mockAccessToken,
				refresh_token: mockRefreshToken,
				id_token: mockIdToken,
			});

			const handleResponse = await oAuth.handleAuthResponse(
				`${currentUrl}?code=12345`
			);
			expect(handleResponse).toEqual({
				state: undefined,
				accessToken: mockAccessToken,
				refreshToken: mockRefreshToken,
				idToken: mockIdToken,
			});
		});
	});
});

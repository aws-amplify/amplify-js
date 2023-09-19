import OAuth from '../src/OAuth/OAuth';
import * as oauthStorage from '../src/OAuth/oauthStorage';

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
	Category: { Auth: 'auth' },
	AuthAction: { FederatedSignIn: '30' },
	getAmplifyUserAgent: () => jest.fn(),
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
		test('an error is thrown for the code flow when there is an error in the authorization response', async () => {
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
			const mockError = 'mock_error';
			const mockErrorDescription = 'mock_error_description';

			try {
				await oAuth.handleAuthResponse(
					`${currentUrl}?code=12345&error=${mockError}&error_description=${mockErrorDescription}`
				);
				fail('error not thrown');
			} catch (err) {
				expect(err.message).toBe(mockErrorDescription);
			}
		});
		test('an error is thrown for the code flow when the state is invalid', async () => {
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
			(oauthStorage.getState as jest.Mock<any>).mockReturnValueOnce('123');
			try {
				const oAuth = new OAuth({
					scopes: [],
					config,
					cognitoClientId: '',
				});
				await oAuth.handleAuthResponse(`${currentUrl}?code=12345`);
				fail('error not thrown');
			} catch (err) {
				expect(err.message).toBe('Invalid state in OAuth flow');
			}
		});
	});

	test('an error is thrown when the scopes is not a String Array', async () => {
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
		try {
			new OAuth({
				scopes: [1, 2, 3] as any,
				config,
				cognitoClientId: '',
			});
			fail('error not thrown');
		} catch (err) {
			expect(err.message).toBe('scopes must be a String Array');
		}
	});
});

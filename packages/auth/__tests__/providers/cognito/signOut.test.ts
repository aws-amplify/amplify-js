import { Amplify } from '@aws-amplify/core';
import { signOut } from '../../../src/providers/cognito';
import * as TokenProvider from '../../../src/providers/cognito/tokenProvider';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { DefaultOAuthStore } from '../../../src/providers/cognito/utils/signInWithRedirectStore';
import { openAuthSession } from '../../../src/utils';

jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');
jest.mock('../../../src/utils');

const mockedAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJvcmlnaW5fanRpIjoiYXNjIn0.4X9nPnldRthcZwi9b0y3rvNn1jvzHnkgJjeEmzmq5VQ';
const mockRefreshToken = 'abcdefghijk';

describe('signOut tests no oauth happy path', () => {
	let tokenStoreSpy;
	let tokenOrchestratorSpy;
	let globalSignOutSpy;
	let revokeTokenSpy;

	beforeEach(() => {
		Amplify.configure(
			{
				Auth: {
					Cognito: {
						userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
						userPoolId: 'us-west-2_zzzzz',
						identityPoolId: 'us-west-2:xxxxxx',
					},
				},
			},
			{
				Auth: {
					tokenProvider: TokenProvider.CognitoUserPoolsTokenProvider,
				},
			}
		);

		revokeTokenSpy = jest
			.spyOn(clients, 'revokeToken')
			.mockImplementation(async () => {
				return {};
			});

		tokenStoreSpy = jest
			.spyOn(TokenProvider.DefaultTokenStore.prototype, 'loadTokens')
			.mockImplementation(async () => {
				return {
					accessToken: decodeJWT(mockedAccessToken),
					refreshToken: mockRefreshToken,
					clockDrift: 0,
				};
			});

		tokenOrchestratorSpy = jest
			.spyOn(TokenProvider.tokenOrchestrator, 'clearTokens')
			.mockImplementation(async () => {});

		globalSignOutSpy = jest
			.spyOn(clients, 'globalSignOut')
			.mockImplementationOnce(async () => {
				return {
					$metadata: {},
				};
			});
	});
	test('test client signOut no oauth', async () => {
		await signOut({ global: false });

		expect(revokeTokenSpy).toBeCalledWith(
			{
				region: 'us-west-2',
			},
			{
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				Token: 'abcdefghijk',
			}
		);
		expect(globalSignOutSpy).not.toHaveBeenCalled();
		expect(tokenOrchestratorSpy).toBeCalled();
		expect(tokenStoreSpy).toBeCalled();
	});

	test('global sign out no oauth', async () => {
		await signOut({ global: true });

		expect(globalSignOutSpy).toBeCalledWith(
			{
				region: 'us-west-2',
			},
			{
				AccessToken: mockedAccessToken,
			}
		);

		expect(tokenOrchestratorSpy).toBeCalled();
		expect(tokenStoreSpy).toBeCalled();
	});

	beforeAll(() => {
		jest.resetAllMocks();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});
});

describe('signOut tests no oauth request fail', () => {
	let tokenStoreSpy;
	let tokenOrchestratorSpy;
	let globalSignOutSpy;
	let revokeTokenSpy;
	let clearCredentialsSpy;
	beforeAll(() => {
		jest.resetAllMocks();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	beforeEach(() => {
		Amplify.configure(
			{
				Auth: {
					Cognito: {
						userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
						userPoolId: 'us-west-2_zzzzz',
						identityPoolId: 'us-west-2:xxxxxx',
					},
				},
			},
			{
				Auth: {
					tokenProvider: TokenProvider.CognitoUserPoolsTokenProvider,
					credentialsProvider: {
						clearCredentialsAndIdentityId() {
							clearCredentialsSpy();
						},
						getCredentialsAndIdentityId(getCredentialsOptions) {
							throw new Error('not implemented');
						},
					},
				},
			}
		);

		clearCredentialsSpy = jest.fn(() => {});

		revokeTokenSpy = jest
			.spyOn(clients, 'revokeToken')
			.mockImplementation(async () => {
				throw new Error('fail!!!');
			});

		tokenStoreSpy = jest
			.spyOn(TokenProvider.DefaultTokenStore.prototype, 'loadTokens')
			.mockImplementation(async () => {
				return {
					accessToken: decodeJWT(mockedAccessToken),
					refreshToken: mockRefreshToken,
					clockDrift: 0,
				};
			});

		tokenOrchestratorSpy = jest
			.spyOn(TokenProvider.tokenOrchestrator, 'clearTokens')
			.mockImplementation(async () => {});

		globalSignOutSpy = jest
			.spyOn(clients, 'globalSignOut')
			.mockImplementation(async () => {
				throw new Error('fail!!!');
			});
	});

	test('test client signOut no oauth', async () => {
		try {
			await signOut({ global: false });
		} catch (err) {
			fail('this shouldnt happen');
		}

		expect(revokeTokenSpy).toBeCalledWith(
			{
				region: 'us-west-2',
			},
			{
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				Token: 'abcdefghijk',
			}
		);

		expect(globalSignOutSpy).not.toHaveBeenCalled();
		expect(tokenOrchestratorSpy).toBeCalled();
		expect(tokenStoreSpy).toBeCalled();
		expect(clearCredentialsSpy).toBeCalled();
	});

	test('global sign out no oauth', async () => {
		try {
			await signOut({ global: true });
		} catch (err) {
			fail('this shouldnt happen');
		}

		expect(globalSignOutSpy).toBeCalledWith(
			{
				region: 'us-west-2',
			},
			{
				AccessToken: mockedAccessToken,
			}
		);

		expect(tokenOrchestratorSpy).toBeCalled();
		expect(tokenStoreSpy).toBeCalled();
	});
});

describe.skip('signOut tests with oauth', () => {
	let tokenStoreSpy;
	let tokenOrchestratorSpy;
	let globalSignOutSpy;
	let revokeTokenSpy;
	let clearCredentialsSpy;
	let oauthStoreSpy;
	const mockOpenAuthSession = openAuthSession as jest.Mock;

	beforeEach(() => {
		Amplify.configure(
			{
				Auth: {
					Cognito: {
						userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
						userPoolId: 'us-west-2_zzzzz',
						identityPoolId: 'us-west-2:xxxxxx',
						loginWith: {
							oauth: {
								domain: 'https://amazonaws.com',
								redirectSignIn: ['http://localhost:3000/'],
								redirectSignOut: ['http://localhost:3000/'],
								responseType: 'code',
								scopes: ['admin'],
							},
						},
					},
				},
			},
			{
				Auth: {
					tokenProvider: TokenProvider.CognitoUserPoolsTokenProvider,
					credentialsProvider: {
						clearCredentialsAndIdentityId() {
							clearCredentialsSpy();
						},
						getCredentialsAndIdentityId(getCredentialsOptions) {
							throw new Error('not implemented');
						},
					},
				},
			}
		);
		oauthStoreSpy = jest
			.spyOn(DefaultOAuthStore.prototype, 'loadOAuthSignIn')
			.mockImplementation(async () => ({
				isOAuthSignIn: true,
				preferPrivateSession: false,
			}));

		revokeTokenSpy = jest
			.spyOn(clients, 'revokeToken')
			.mockImplementation(async () => {
				return {};
			});

		tokenStoreSpy = jest
			.spyOn(TokenProvider.DefaultTokenStore.prototype, 'loadTokens')
			.mockImplementation(async () => {
				return {
					accessToken: decodeJWT(mockedAccessToken),
					refreshToken: mockRefreshToken,
					clockDrift: 0,
				};
			});

		clearCredentialsSpy = jest.fn(() => {});

		tokenOrchestratorSpy = jest
			.spyOn(TokenProvider.tokenOrchestrator, 'clearTokens')
			.mockImplementation(async () => {});

		globalSignOutSpy = jest
			.spyOn(clients, 'globalSignOut')
			.mockImplementationOnce(async () => {
				return {
					$metadata: {},
				};
			});
	});
	test('test client signOut with oauth', async () => {
		await signOut({ global: false });

		expect(revokeTokenSpy).toBeCalledWith(
			{
				region: 'us-west-2',
			},
			{
				ClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
				Token: 'abcdefghijk',
			}
		);
		expect(globalSignOutSpy).not.toHaveBeenCalled();
		expect(tokenOrchestratorSpy).toBeCalled();
		expect(tokenStoreSpy).toBeCalled();
		expect(mockOpenAuthSession).toBeCalledWith(
			'https://https://amazonaws.com/logout?client_id=111111-aaaaa-42d8-891d-ee81a1549398&logout_uri=http%3A%2F%2Flocalhost%3A3000%2F',
			['http://localhost:3000/'],
			false
		);
		expect(clearCredentialsSpy).toBeCalled();
	});

	test('global sign out with oauth', async () => {
		await signOut({ global: true });

		expect(globalSignOutSpy).toBeCalledWith(
			{
				region: 'us-west-2',
			},
			{
				AccessToken: mockedAccessToken,
			}
		);

		expect(tokenOrchestratorSpy).toBeCalled();
		expect(tokenStoreSpy).toBeCalled();
		expect(mockOpenAuthSession).toBeCalledWith(
			'https://https://amazonaws.com/logout?client_id=111111-aaaaa-42d8-891d-ee81a1549398&logout_uri=http%3A%2F%2Flocalhost%3A3000%2F',
			['http://localhost:3000/'],
			false
		);
		expect(clearCredentialsSpy).toBeCalled();
	});
});

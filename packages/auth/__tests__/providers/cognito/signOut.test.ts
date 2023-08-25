import { AmplifyV6 as Amplify } from '@aws-amplify/core';
import { signOut } from '../../../src/providers/cognito';
import * as TokenProvider from '../../../src/providers/cognito/tokenProvider';
import { decodeJWT } from '@aws-amplify/core/internals/utils';
jest.mock('@aws-amplify/core/lib/clients/handlers/fetch');
import * as clients from '../../../src/providers/cognito/utils/clients/CognitoIdentityProvider';

const mockedAccessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJvcmlnaW5fanRpIjoiYXNjIn0.4X9nPnldRthcZwi9b0y3rvNn1jvzHnkgJjeEmzmq5VQ';
const mockRefreshToken = 'abcdefghijk';

describe('signOut tests no oauth', () => {
	let tokenStoreSpy;
	let tokenOrchestratorSpy;
	let globalSignOutSpy;
	let revokeTokenSpy;
	beforeEach(() => {
		Amplify.configure(
			{
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
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
});

describe('signOut tests with oauth', () => {
	let tokenStoreSpy;
	let tokenOrchestratorSpy;
	let globalSignOutSpy;
	let revokeTokenSpy;
	let windowOpenSpy;
	beforeEach(() => {
		Amplify.configure(
			{
				Auth: {
					userPoolWebClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
					userPoolId: 'us-west-2_zzzzz',
					identityPoolId: 'us-west-2:xxxxxx',
					oauth: {
						domain: 'https://amazonaws.com',
						redirectSignIn: 'http://localhost:3000/',
						redirectSignOut: 'http://localhost:3000/',
						responseType: 'code',
						scopes: ['admin'],
					},
				},
			},
			{
				Auth: {
					tokenProvider: TokenProvider.CognitoUserPoolsTokenProvider,
				},
			}
		);

		windowOpenSpy = jest.spyOn(window, 'open').mockImplementation();

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
		expect(windowOpenSpy).toBeCalledWith(
			'https://https://amazonaws.com/logout?client_id=111111-aaaaa-42d8-891d-ee81a1549398&logout_uri=http%3A%2F%2Flocalhost%3A3000%2F',
			'_self'
		);
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
		expect(windowOpenSpy).toBeCalledWith(
			'https://https://amazonaws.com/logout?client_id=111111-aaaaa-42d8-891d-ee81a1549398&logout_uri=http%3A%2F%2Flocalhost%3A3000%2F',
			'_self'
		);
	});
});

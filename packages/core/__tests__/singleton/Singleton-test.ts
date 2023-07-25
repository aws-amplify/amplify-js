import { Credentials } from '@aws-sdk/types';
import { Amplify } from '../../src/singleton';
import { Auth, decodeJWT } from '../../src/singleton/Auth';
import { MemoryKeyValueStorage } from '../../src/StorageHelper';

type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any
	? A
	: never;

describe('Amplify config test', () => {
	test('Happy path Set and Get config', () => {
		expect.assertions(1);
		const config: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
		};

		Amplify.configure(config);
		const result = Amplify.getConfig();

		expect(result).toEqual(config);
	});

	test('Incremental set and get config', () => {
		expect.assertions(1);
		const config1: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				userPoolId: 'us-east-1:aaaaaaa',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
		};

		Amplify.configure(config1);

		const config2: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				identityPoolId: 'us-east-1:bbbbb',
			},
		};
		Amplify.configure(config2);

		const result = Amplify.getConfig();

		expect(result).toEqual({
			Auth: {
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
		});
	});
});

describe('Session tests', () => {
	test('fetch empty session', async () => {
		const config: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
		};

		Amplify.configure(config);

		const session = await Amplify.Auth.fetchAuthSession();
		// session.
	});

	test('fetch user after signIn no credentials', async () => {
		const config: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
		};

		Amplify.configure(config);
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
		const mockToken = decodeJWT(token);

		function signIn() {
			Amplify.Auth.setTokens({
				accessToken: mockToken,
				accessTokenExpAt: 2000000000000,
			});
		}

		signIn();

		const session = await Amplify.Auth.fetchAuthSession();

		expect(session.tokens?.accessToken.payload).toEqual({
			exp: 1710293130,
			iat: 1516239022,
			name: 'John Doe',
			sub: '1234567890',
		});

		expect(session.tokens?.accessTokenExpAt).toBe(2000000000000);
	});

	test('fetch user after signIn no credentials but with identity provider', async () => {
		const config: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
		};

		const identitySpy = jest.fn(async ({ tokens, authConfig }) => 'identityId');

		Amplify.configure(config, { Auth: { identityIdProvider: identitySpy } });
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
		const mockToken = decodeJWT(token);

		function signIn() {
			Amplify.Auth.setTokens({
				accessToken: mockToken,
				accessTokenExpAt: 2000000000000,
			});
		}

		signIn();

		const session = await Amplify.Auth.fetchAuthSession();

		expect(session.tokens?.accessToken.payload).toEqual({
			exp: 1710293130,
			iat: 1516239022,
			name: 'John Doe',
			sub: '1234567890',
		});

		expect(session.tokens?.accessTokenExpAt).toBe(2000000000000);

		expect(session.awsCredsIdentityId).toBe('identityId');

		expect(identitySpy).toBeCalledWith({
			authConfig: {
				identityPoolId: 'us-east-1:bbbbb',
				userPoolId: 'us-east-1:aaaaaaa',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
			tokens: {
				accessToken: {
					payload: {
						exp: 1710293130,
						iat: 1516239022,
						name: 'John Doe',
						sub: '1234567890',
					},
					toString: expect.anything(),
				},
				accessTokenExpAt: 2000000000000,
				clockDrift: 0,
				idToken: undefined,
				metadata: {},
			},
		});
	});
	test('fetch user after signIn with credentials and with identity provider', async () => {
		const config: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
		};

		const identitySpy = jest.fn(
			async ({ tokens, authConfig }) => 'identityIdValue'
		);
		const credentialsSpy = jest.fn(
			async ({ tokens, authConfig, identityId }): Promise<Credentials> => {
				return {
					accessKeyId: 'accessKeyIdValue',
					secretAccessKey: 'secretAccessKeyValue',
					sessionToken: 'sessionTokenValue',
					expiration: new Date(123),
				};
			}
		);

		Amplify.configure(config, {
			Auth: {
				identityIdProvider: identitySpy,
				credentialsProvider: {
					getCredentials: credentialsSpy,
					clearCredentials: () => {},
				},
			},
		});
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
		const mockToken = decodeJWT(token);

		function signIn() {
			Amplify.Auth.setTokens({
				accessToken: mockToken,
				accessTokenExpAt: 2000000000000,
			});
		}

		signIn();

		const session = await Amplify.Auth.fetchAuthSession();

		expect(session.tokens?.accessToken.payload).toEqual({
			exp: 1710293130,
			iat: 1516239022,
			name: 'John Doe',
			sub: '1234567890',
		});

		expect(session.tokens?.accessTokenExpAt).toBe(2000000000000);

		expect(session.awsCredsIdentityId).toBe('identityIdValue');

		expect(session.awsCreds).toEqual({
			accessKeyId: 'accessKeyIdValue',
			secretAccessKey: 'secretAccessKeyValue',
			sessionToken: 'sessionTokenValue',
			expiration: new Date(123),
		});

		expect(identitySpy).toBeCalledWith({
			authConfig: {
				identityPoolId: 'us-east-1:bbbbb',
				userPoolId: 'us-east-1:aaaaaaa',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
			tokens: {
				accessToken: {
					payload: {
						exp: 1710293130,
						iat: 1516239022,
						name: 'John Doe',
						sub: '1234567890',
					},
					toString: expect.anything(),
				},
				accessTokenExpAt: 2000000000000,
				clockDrift: 0,
				idToken: undefined,
				metadata: {},
			},
		});

		expect(credentialsSpy).toBeCalledWith({
			authConfig: {
				identityPoolId: 'us-east-1:bbbbb',
				userPoolId: 'us-east-1:aaaaaaa',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
			tokens: {
				accessToken: {
					payload: {
						exp: 1710293130,
						iat: 1516239022,
						name: 'John Doe',
						sub: '1234567890',
					},
					toString: expect.anything(),
				},
				accessTokenExpAt: 2000000000000,
				clockDrift: 0,
				idToken: undefined,
				metadata: {},
			},
			identityId: 'identityIdValue',
		});
	});

	test('listen session changes', async () => {
		expect.assertions(4);
		const auth = new Auth();
		auth.configure(
			{
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
			{
				keyValueStorage: MemoryKeyValueStorage,
			}
		);

		let subscription = auth.listenSessionChanges().subscribe({
			next: authSession => {
				expect(authSession.isSignedIn).toBe(true);
				expect(authSession.tokens?.accessTokenExpAt).toBe(2000000000000);
				expect(authSession.tokens?.metadata).toBe(undefined);
			},
		});

		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
		const mockToken = decodeJWT(token);

		async function signIn() {
			await auth.setTokens({
				accessToken: mockToken,
				accessTokenExpAt: 2000000000000,
			});
		}

		await signIn();

		subscription.unsubscribe();

		subscription = auth.listenSessionChanges().subscribe({
			next: authSession => {
				expect(authSession.isSignedIn).toBe(false);
			},
		});

		await auth.clearTokens();
	});

	test('refresh tokens with forceRefresh success', async () => {
		expect.assertions(1);
		const auth = new Auth();
		const tokenRefresherSpy = jest.fn(async () => {
			const token =
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
			const mockToken = decodeJWT(token);
			return {
				accessToken: mockToken,
				accessTokenExpAt: 2000000000000,
			};
		});

		auth.configure(
			{
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
			{
				keyValueStorage: MemoryKeyValueStorage,
				tokenRefresher: tokenRefresherSpy,
			}
		);

		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
		const mockToken = decodeJWT(token);

		async function signIn() {
			await auth.setTokens({
				accessToken: mockToken,
				accessTokenExpAt: 2000000000000,
			});
		}

		await signIn();

		const tokens = await auth.fetchAuthSession({ forceRefresh: true });
		expect(tokenRefresherSpy).toBeCalledWith({
			authConfig: {
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
			tokens: {
				accessToken: {
					payload: {
						exp: 1710293130,
						iat: 1516239022,
						name: 'John Doe',
						sub: '1234567890',
					},
					toString: expect.anything(),
				},
				accessTokenExpAt: 2000000000000,
				clockDrift: 0,
				idToken: undefined,
				metadata: {},
			},
		});
	});

	test('refresh tokens with forceRefresh failed', async () => {
		expect.assertions(2);
		const auth = new Auth();
		const tokenRefresherSpy = jest.fn(async () => {
			throw new Error('no no no');
		});

		auth.configure(
			{
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
			{
				keyValueStorage: MemoryKeyValueStorage,
				tokenRefresher: tokenRefresherSpy,
			}
		);

		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
		const mockToken = decodeJWT(token);

		async function signIn() {
			await auth.setTokens({
				accessToken: mockToken,
				accessTokenExpAt: 2000000000000,
			});
		}

		await signIn();

		const session = await auth.fetchAuthSession({ forceRefresh: true });
		expect(session.tokens).toBe(undefined);
		expect(tokenRefresherSpy).toBeCalled();
	});

	test('refresh tokens with accessToken expired failed', async () => {
		expect.assertions(2);
		const auth = new Auth();
		const tokenRefresherSpy = jest.fn(async () => {
			throw new Error('no no no');
		});

		auth.configure(
			{
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
			{
				keyValueStorage: MemoryKeyValueStorage,
				tokenRefresher: tokenRefresherSpy,
			}
		);

		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
		const mockToken = decodeJWT(token);

		async function signIn() {
			await auth.setTokens({
				accessToken: mockToken,
				accessTokenExpAt: 0,
			});
		}

		await signIn();

		const session = await auth.fetchAuthSession({ forceRefresh: false });
		expect(session.tokens).toBe(undefined);
		expect(tokenRefresherSpy).toBeCalled();
	});
});

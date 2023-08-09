import { Credentials } from '@aws-sdk/types';
import { AmplifyV6 as Amplify } from '../../src/singleton';
import { AuthClass as Auth } from '../../src/singleton/Auth';
import { decodeJWT } from '../../src/singleton/Auth/utils';
import { MemoryKeyValueStorage } from '../../src/StorageHelper';
import { AWSCredentialsAndIdentityId } from '../../src/singleton/Auth/types';

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

	test('fetch user after no credentials', async () => {
		expect.assertions(2);
		const config: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
		};

		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
		const mockToken = decodeJWT(token);
		const spyTokenProvider = jest.fn(async () => {
			return {
				accessToken: mockToken,
			};
		});
		Amplify.configure(config, {
			Auth: {
				tokenProvider: {
					getTokens: spyTokenProvider,
				},
			},
		});

		const session = await Amplify.Auth.fetchAuthSession();
		expect(spyTokenProvider).toBeCalled();

		expect(session.tokens?.accessToken.payload).toEqual({
			exp: 1710293130,
			iat: 1516239022,
			name: 'John Doe',
			sub: '1234567890',
		});
	});

	test('fetch session with token and credentials', async () => {
		const config: ArgumentTypes<typeof Amplify.configure>[0] = {
			Auth: {
				userPoolId: 'us-east-1:aaaaaaa',
				identityPoolId: 'us-east-1:bbbbb',
				userPoolWebClientId: 'aaaaaaaaaaaa',
			},
		};

		const credentialsSpy = jest.fn(
			async ({
				tokens,
				authConfig,
				identityId,
			}): Promise<AWSCredentialsAndIdentityId> => {
				return {
					credentials: {
						accessKeyId: 'accessKeyIdValue',
						secretAccessKey: 'secretAccessKeyValue',
						sessionToken: 'sessionTokenValue',
						expiration: new Date(123),
					},
					identityId: 'identityIdValue',
				};
			}
		);
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
		const mockToken = decodeJWT(token);

		const spyTokenProvider = jest.fn(async () => {
			return {
				accessToken: mockToken,
			};
		});

		Amplify.configure(config, {
			Auth: {
				credentialsProvider: {
					getCredentialsAndIdentityId: credentialsSpy,
					clearCredentials: () => {},
				},
				tokenProvider: {
					getTokens: spyTokenProvider,
				},
			},
		});

		const session = await Amplify.Auth.fetchAuthSession();

		expect(session.tokens?.accessToken.payload).toEqual({
			exp: 1710293130,
			iat: 1516239022,
			name: 'John Doe',
			sub: '1234567890',
		});

		expect(session.identityId).toBe('identityIdValue');

		expect(session.credentials).toEqual({
			accessKeyId: 'accessKeyIdValue',
			secretAccessKey: 'secretAccessKeyValue',
			sessionToken: 'sessionTokenValue',
			expiration: new Date(123),
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
				idToken: undefined,
			},
		});
	});

	// test('refresh tokens with forceRefresh success', async () => {
	// 	expect.assertions(1);
	// 	const auth = new Auth();
	// 	const tokenRefresherSpy = jest.fn(async () => {
	// 		const token =
	// 			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
	// 		const mockToken = decodeJWT(token);
	// 		return {
	// 			accessToken: mockToken,
	// 			accessTokenExpAt: 2000000000000,
	// 		};
	// 	});

	// 	auth.configure(
	// 		{
	// 			userPoolId: 'us-east-1:aaaaaaa',
	// 			identityPoolId: 'us-east-1:bbbbb',
	// 			userPoolWebClientId: 'aaaaaaaaaaaa',
	// 		},
	// 		{
	// 			keyValueStorage: MemoryKeyValueStorage,
	// 			tokenRefresher: tokenRefresherSpy,
	// 		}
	// 	);

	// 	const token =
	// 		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
	// 	const mockToken = decodeJWT(token);

	// 	async function signIn() {
	// 		await auth.setTokens({
	// 			accessToken: mockToken,
	// 			accessTokenExpAt: 2000000000000,
	// 		});
	// 	}

	// 	await signIn();

	// 	const tokens = await auth.fetchAuthSession({ forceRefresh: true });
	// 	expect(tokenRefresherSpy).toBeCalledWith({
	// 		authConfig: {
	// 			userPoolId: 'us-east-1:aaaaaaa',
	// 			identityPoolId: 'us-east-1:bbbbb',
	// 			userPoolWebClientId: 'aaaaaaaaaaaa',
	// 		},
	// 		tokens: {
	// 			accessToken: {
	// 				payload: {
	// 					exp: 1710293130,
	// 					iat: 1516239022,
	// 					name: 'John Doe',
	// 					sub: '1234567890',
	// 				},
	// 				toString: expect.anything(),
	// 			},
	// 			accessTokenExpAt: 2000000000000,
	// 			clockDrift: 0,
	// 			idToken: undefined,
	// 			metadata: {},
	// 		},
	// 	});
	// });

	// test('refresh tokens with forceRefresh failed', async () => {
	// 	expect.assertions(2);
	// 	const auth = new Auth();
	// 	const tokenRefresherSpy = jest.fn(async () => {
	// 		throw new Error('no no no');
	// 	});

	// 	auth.configure(
	// 		{
	// 			userPoolId: 'us-east-1:aaaaaaa',
	// 			identityPoolId: 'us-east-1:bbbbb',
	// 			userPoolWebClientId: 'aaaaaaaaaaaa',
	// 		},
	// 		{
	// 			keyValueStorage: MemoryKeyValueStorage,
	// 			tokenRefresher: tokenRefresherSpy,
	// 		}
	// 	);

	// 	const token =
	// 		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
	// 	const mockToken = decodeJWT(token);

	// 	async function signIn() {
	// 		await auth.setTokens({
	// 			accessToken: mockToken,
	// 			accessTokenExpAt: 2000000000000,
	// 		});
	// 	}

	// 	await signIn();

	// 	const session = await auth.fetchAuthSession({ forceRefresh: true });
	// 	expect(session.tokens).toBe(undefined);
	// 	expect(tokenRefresherSpy).toBeCalled();
	// });

	// test('refresh tokens with accessToken expired failed', async () => {
	// 	expect.assertions(2);
	// 	const auth = new Auth();
	// 	const tokenRefresherSpy = jest.fn(async () => {
	// 		throw new Error('no no no');
	// 	});

	// 	auth.configure(
	// 		{
	// 			userPoolId: 'us-east-1:aaaaaaa',
	// 			identityPoolId: 'us-east-1:bbbbb',
	// 			userPoolWebClientId: 'aaaaaaaaaaaa',
	// 		},
	// 		{
	// 			tokenProvider
	// 		}
	// 	);

	// 	const token =
	// 		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';
	// 	const mockToken = decodeJWT(token);

	// 	const session = await auth.fetchAuthSession({ forceRefresh: false });
	// 	expect(session.tokens).toBe(undefined);
	// 	expect(tokenRefresherSpy).toBeCalled();
	// });
});

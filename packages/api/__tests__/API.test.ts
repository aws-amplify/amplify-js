import { Amplify, ResourcesConfig } from 'aws-amplify';
import { GraphQLAPI } from '@aws-amplify/api-graphql';
import { generateClient, CONNECTION_STATE_CHANGE } from '@aws-amplify/api';
import { AmplifyClassV6 } from '@aws-amplify/core';
import { Observable } from 'rxjs';
import { decodeJWT } from '@aws-amplify/core';

type AuthMode =
	| 'apiKey'
	| 'oidc'
	| 'userPool'
	| 'iam'
	| 'identityPool'
	| 'lambda'
	| 'none';

const DEFAULT_AUTH_MODE = 'apiKey';
const DEFAULT_API_KEY = 'FAKE-KEY';
const CUSTOM_API_KEY = 'CUSTOM-API-KEY';

const DEFAULT_ENDPOINT = 'https://a-default-appsync-endpoint.local/graphql';
const CUSTOM_ENDPOINT = 'https://a-custom-appsync-endpoint.local/graphql';

/**
 * Valid JWT string, borrowed from Auth tests
 */
const DEFAULT_AUTH_TOKEN =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';

const _postSpy = jest.spyOn((GraphQLAPI as any)._api, 'post');
const _subspy = jest.spyOn((GraphQLAPI as any).appSyncRealTime, 'subscribe');

/**
 * Validates that a specific "post" occurred (against `_postSpy`).
 *
 * @param options
 */
function expectPost({
	endpoint,
	authMode,
	apiKeyOverride,
	authTokenOverride,
}: {
	endpoint: string;
	authMode: AuthMode;
	apiKeyOverride: string | undefined;
	authTokenOverride: string | undefined;
}) {
	// Grabbing the call and asserting on the object is significantly simpler for some
	// of the is-unknown-or-absent types of assertions we need.
	//
	// It is also incidentally much simpler for most the other assertions too ...
	//
	const postOptions = _postSpy.mock.calls[0][1] as {
		// just the things we care about
		url: URL;
		options: {
			headers: Record<string, string>;
		};
	};

	expect(postOptions.url.toString()).toEqual(endpoint);

	if (authMode === 'apiKey') {
		expect(postOptions.options.headers['X-Api-Key']).toEqual(
			apiKeyOverride ?? DEFAULT_API_KEY,
		);
	} else {
		expect(postOptions.options.headers['X-Api-Key']).toBeUndefined();
	}

	if (['oidc', 'userPool'].includes(authMode)) {
		expect(postOptions.options.headers['Authorization']).toEqual(
			authTokenOverride ?? DEFAULT_AUTH_TOKEN,
		);
	} else {
		expect(postOptions.options.headers['Authorization']).toBeUndefined();
	}
}

/**
 * Validates that a specific subscription occurred (against `_subSpy`).
 *
 * @param options
 */
function expectSubscription({
	endpoint,
	authMode,
	apiKeyOverride,
	authTokenOverride,
}: {
	endpoint: string;
	authMode: AuthMode;
	apiKeyOverride: string | undefined;
	authTokenOverride: string | undefined;
}) {
	// `authMode` is provided to appsync provider, which then determines how to
	// handle auth internally.
	expect(_subspy).toHaveBeenCalledWith(
		expect.objectContaining({
			appSyncGraphqlEndpoint: endpoint,
			authenticationType: authMode,

			// appsync provider only receive an authToken if it has been explicitly overridden.
			authToken: authTokenOverride,

			// appsync provider already receive an apiKey.
			// (but it should not send it unless authMode is apiKey.)
			apiKey: apiKeyOverride ?? DEFAULT_API_KEY,
		}),
		expect.anything(),
	);
}

/**
 * Validates that a specific operation was submitted to the correct underlying
 * execution mechanism (post or AppSyncRealtime).
 *
 * @param param0
 */
function expectOp({
	op,
	endpoint,
	authMode,
	apiKeyOverride,
	authTokenOverride,
}: {
	op: 'subscription' | 'query';
	endpoint: string;
	authMode: AuthMode;
	apiKeyOverride?: string | undefined;
	authTokenOverride?: string | undefined;
}) {
	const expecto = op === 'subscription' ? expectSubscription : expectPost;
	expecto({ endpoint, authMode, apiKeyOverride, authTokenOverride }); // test pass ... umm ...
}

describe.skip('API generateClient', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('client-side client.graphql', async () => {
		jest.spyOn(AmplifyClassV6.prototype, 'getConfig').mockImplementation(() => {
			return {
				API: { GraphQL: { endpoint: 'test', defaultAuthMode: 'none' } },
			};
		});
		const spy = jest
			.spyOn(GraphQLAPI, 'graphql')
			.mockResolvedValue('grapqhqlResponse' as any);
		const client = generateClient();
		expect(await client.graphql({ query: 'query' })).toBe('grapqhqlResponse');
		expect(spy).toHaveBeenCalledWith(
			{ Auth: {}, libraryOptions: {}, resourcesConfig: {} },
			{ query: 'query' },
			undefined,
			{
				action: '1',
				category: 'api',
			},
		);
	});

	test('CONNECTION_STATE_CHANGE importable as a value, not a type', async () => {
		expect(CONNECTION_STATE_CHANGE).toBe('ConnectionStateChange');
	});
	// test('server-side client.graphql', async () => {
	// 	const config: ResourcesConfig = {
	// 		API: {
	// 			GraphQL: {
	// 				apiKey: 'adsf',
	// 				customEndpoint: undefined,
	// 				customEndpointRegion: undefined,
	// 				defaultAuthMode: 'apiKey',
	// 				endpoint: 'https://0.0.0.0/graphql',
	// 				region: 'us-east-1',
	// 			},
	// 		},
	// 	};

	// 	const query = `query Q {
	// 		getWidget {
	// 			__typename id owner createdAt updatedAt someField
	// 		}
	// 	}`;

	// 	const spy = jest
	// 		.spyOn(InternalGraphQLAPIClass.prototype, 'graphql')
	// 		.mockResolvedValue('grapqhqlResponse' as any);

	// 	await runWithAmplifyServerContext(config, {}, ctx => {
	// 		const client = generateClientSSR(ctx);
	// 		return client.graphql({ query }) as any;
	// 	});

	// 	expect(spy).toHaveBeenCalledWith(
	// 		expect.objectContaining({
	// 			resourcesConfig: config,
	// 		}),
	// 		{ query },
	// 		undefined
	// 	);
	// });
});

describe.only('Custom Endpoints', () => {
	beforeEach(() => {
		Amplify.configure(
			{
				API: {
					GraphQL: {
						defaultAuthMode: DEFAULT_AUTH_MODE,
						apiKey: DEFAULT_API_KEY,
						endpoint: DEFAULT_ENDPOINT,
						region: 'north-pole-7',
					},
				},
				Auth: {
					Cognito: {
						userPoolId: 'north-pole-7:santas-little-helpers',
						identityPoolId: 'north-pole-7:santas-average-sized-helpers',
						userPoolClientId: 'the-mrs-claus-oversight-committee',
					},
				},
			},
			{
				Auth: {
					credentialsProvider: {
						getCredentialsAndIdentityId: async arg => ({
							credentials: {
								accessKeyId: 'accessKeyIdValue',
								secretAccessKey: 'secretAccessKeyValue',
								sessionToken: 'sessionTokenValue',
								expiration: new Date(123),
							},
							identityId: 'mrs-clause-naturally',
						}),
						clearCredentialsAndIdentityId: async () => {},
					},
					tokenProvider: {
						getTokens: async () => ({
							accessToken: decodeJWT(DEFAULT_AUTH_TOKEN),
						}),
					},
				},
			},
		);
		_postSpy.mockReturnValue({
			body: {
				json() {
					return JSON.stringify({
						data: {
							someOperation: {
								someField: 'some value',
							},
						},
					});
				},
			},
		});
		_subspy.mockReturnValue(new Observable());
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	for (const op of ['query', 'subscription'] as const) {
		const opType = op === 'subscription' ? 'sub' : 'qry';

		test(`client { endpoint: N, authMode: N } + ${opType} { authMode: N } -> config.authMode`, async () => {
			const client = generateClient();

			await client.graphql({ query: `${op} A { queryA { a b c } }` });

			expectOp({
				op,
				endpoint: DEFAULT_ENDPOINT,
				authMode: DEFAULT_AUTH_MODE,
			});
		});

		test(`client { endpoint: N, authMode: N } + ${opType} { authMode: Y } -> op.authMode`, async () => {
			const client = generateClient();

			await client.graphql({
				query: `${op} A { queryA { a b c } }`,
				authMode: 'none',
			});

			expectOp({
				op,
				endpoint: DEFAULT_ENDPOINT,
				authMode: 'none',
			});
		});

		test(`client { endpoint: N, authMode: Y } + ${opType} { authMode: N } -> client.authMode`, async () => {
			const client = generateClient({
				authMode: 'none',
			});

			await client.graphql({
				query: `${op} A { queryA { a b c } }`,
			});

			expectOp({
				op,
				endpoint: DEFAULT_ENDPOINT,
				authMode: 'none',
			});
		});

		test(`client { endpoint: N, authMode: Y } + ${opType} { authMode: Y } -> op.authMode`, async () => {
			const client = generateClient({
				authMode: 'apiKey',
			});

			await client.graphql({
				query: `${op} A { queryA { a b c } }`,
				authMode: 'none',
			});

			expectOp({
				op,
				endpoint: DEFAULT_ENDPOINT,
				authMode: 'none',
			});
		});

		test(`client { endpoint: Y, authMode: N } + ${opType} { authMode: N } -> none (defaulted)`, async () => {
			const client = generateClient({
				endpoint: CUSTOM_ENDPOINT,
				authMode: 'userPool',
			});

			await client.graphql({
				query: `${op} A { queryA { a b c } }`,
			});

			expectOp({
				op,
				endpoint: CUSTOM_ENDPOINT,
				authMode: 'userPool',
			});
		});

		test(`client { endpoint: Y, authMode: N } + ${opType} { authMode: Y } -> op.authMode`, async () => {
			const client = generateClient({
				endpoint: CUSTOM_ENDPOINT,
				authMode: 'apiKey',
				apiKey: CUSTOM_API_KEY,
			});

			await client.graphql({
				query: `${op} A { queryA { a b c } }`,
				authMode: 'userPool',
			});

			expectOp({
				op,
				endpoint: CUSTOM_ENDPOINT,
				authMode: 'userPool',
				apiKeyOverride: CUSTOM_API_KEY,
			});
		});

		test(`client { endpoint: Y, authMode: Y } + ${opType} { authMode: N } -> client.authMode`, async () => {
			const client = generateClient({
				endpoint: CUSTOM_ENDPOINT,
				authMode: 'apiKey',
				apiKey: CUSTOM_API_KEY,
			});

			await client.graphql({
				query: `${op} A { queryA { a b c } }`,
			});

			expectOp({
				op,
				endpoint: CUSTOM_ENDPOINT,
				authMode: 'apiKey',
				apiKeyOverride: CUSTOM_API_KEY,
			});
		});

		test(`client { endpoint: Y, authMode: Y } + ${opType} { authMode: Y } -> op.authMode`, async () => {
			const client = generateClient({
				endpoint: CUSTOM_ENDPOINT,
				authMode: 'none',
			});

			await client.graphql({
				query: `${op} A { queryA { a b c } }`,
				authMode: 'apiKey',
			});

			expectOp({
				op,
				endpoint: CUSTOM_ENDPOINT,
				authMode: 'apiKey',
			});
		});
	}
});

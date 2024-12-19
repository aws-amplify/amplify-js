import { enableFetchMocks } from 'jest-fetch-mock';
import { Amplify } from '@aws-amplify/core';
import { GraphQLAPI } from '@aws-amplify/api-graphql';
import { generateClient, CONNECTION_STATE_CHANGE } from '@aws-amplify/api';
import { generateServerClientUsingCookies, generateServerClientUsingReqRes } from '@aws-amplify/adapter-nextjs/api';
import { generateClientWithAmplifyInstance } from '@aws-amplify/api/internals';
import { Observable } from 'rxjs';
import { decodeJWT } from '@aws-amplify/core';

// Make global `Request` available. (Necessary for using `adapter-nextjs` clients.)
enableFetchMocks();

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
 * Validly parsable JWT string. (Borrowed from Auth tests.)
 */
const DEFAULT_AUTH_TOKEN =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MTAyOTMxMzB9.YzDpgJsrB3z-ZU1XxMcXSQsMbgCzwH_e-_76rnfehh0';

const _postSpy = jest.spyOn((GraphQLAPI as any)._api, 'post');
const _subspy = jest.fn();

/**
 * Should be called on every subscription, ensuring that realtime provider instances
 * are re-used for each distinct endpoint.
 */
const _setProviderSpy = jest.fn();

(GraphQLAPI as any).appSyncRealTime = {
	get() {
		return { subscribe: _subspy }
	},
	set: _setProviderSpy
};

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
	//
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
	expect(_setProviderSpy).toHaveBeenCalledWith(endpoint, expect.anything());
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
	const doExpect = op === 'subscription' ? expectSubscription : expectPost;
	doExpect({ endpoint, authMode, apiKeyOverride, authTokenOverride }); // test pass ... umm ...
}

function prepareMocks() {
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
}

describe('generateClient (web)', () => {
	beforeEach(() => {
		prepareMocks()
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	for (const op of ['query', 'subscription'] as const) {
		const opType = op === 'subscription' ? 'sub' : 'qry';

		describe(`[${opType}] without a custom endpoint`, () => {
			test("does not require `authMode` or `apiKey` override", () => {
				expect(() => { generateClient() }).not.toThrow();
			});

			test("does not require `authMode` or `apiKey` override in client.graphql()", async () => {
				const client = generateClient();

				await client.graphql({ query: `${op} A { queryA { a b c } }` });
	
				expectOp({
					op,
					endpoint: DEFAULT_ENDPOINT,
					authMode: DEFAULT_AUTH_MODE,
				});
			});

			test("allows `authMode` override in client", async () => {
				const client = generateClient({
					authMode: 'userPool',
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
				});
	
				expectOp({
					op,
					endpoint: DEFAULT_ENDPOINT,
					authMode: 'userPool',
				});
			});

			test("allows `authMode` override in `client.graphql()`", async () => {
				const client = generateClient();
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
					authMode: 'userPool',
				});
	
				expectOp({
					op,
					endpoint: DEFAULT_ENDPOINT,
					authMode: 'userPool',
				});
			});

			test("allows `apiKey` override in `client.graphql()`", async () => {
				const client = generateClient();
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
					apiKey: CUSTOM_API_KEY,
				});
	
				expectOp({
					op,
					endpoint: DEFAULT_ENDPOINT,
					authMode: 'apiKey',
					apiKeyOverride: CUSTOM_API_KEY
				});
			});

			test("allows `authMode` + `apiKey` override in `client.graphql()`", async () => {
				const client = generateClient({
					authMode: 'userPool'
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
					authMode: 'apiKey',
					apiKey: CUSTOM_API_KEY,
				});
	
				expectOp({
					op,
					endpoint: DEFAULT_ENDPOINT,
					authMode: 'apiKey',
					apiKeyOverride: CUSTOM_API_KEY
				});
			});
		});

		describe(`[${opType}] with a custom endpoint`, () => {
			test("requires `authMode` override", () => {
				// @ts-expect-error
				expect(() => generateClient({
					endpoint: CUSTOM_ENDPOINT
				})).toThrow()
			})

			test("requires `apiKey` with `authMode: 'apiKey'` override in client", async () => {
				expect(() =>  {
					generateClient({
						endpoint: CUSTOM_ENDPOINT,
						// @ts-expect-error
						authMode: 'apiKey',
					})
				}).toThrow();
			});

			test("allows `authMode` override in client", async () => {
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

			test("allows `authMode: 'none'` override in client.graphql()", async () => {
				const client = generateClient({
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'none',
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
				});
	
				expectOp({
					op,
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'none',
				});
			});

			test("allows `authMode: 'apiKey'` + `apiKey` override in client", async () => {
				const client = generateClient({
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'apiKey',
					apiKey: CUSTOM_API_KEY
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
				});
	
				expectOp({
					op,
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'apiKey',
					apiKeyOverride: CUSTOM_API_KEY
				});
			});

			test("allows `authMode` override in client.graphql()", async () => {
				const client = generateClient({
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'none',
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
					authMode: 'userPool'
				});
	
				expectOp({
					op,
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'userPool',
				});
			});

			test("requires `apiKey` with `authMode: 'apiKey'` override in client.graphql()", async () => {
				const client = generateClient({
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'none',
				});
	
				// @ts-expect-error
				expect(() => client.graphql({
					query: `${op} A { queryA { a b c } }`,
					authMode: 'apiKey'
				})).toThrow()
			});

			test("allows `authMode: 'apiKey'` + `apiKey` override in client.graphql()", async () => {
				const client = generateClient({
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'none',
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
					authMode: 'apiKey',
					apiKey: CUSTOM_API_KEY
				});
	
				expectOp({
					op,
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'apiKey',
					apiKeyOverride: CUSTOM_API_KEY
				});
			});
		})
	};
});

describe('generateClient (cookie client)', () => {

	/**
	 * NOTICE
	 * 
	 * Cookie client is largely a pass-thru to `generateClientWithAmplifyInstance`.
	 * 
	 * These tests intend to cover narrowing rules on the public surface. Behavior is
	 * tested in the `SSR common` describe block.
	 */
	
	beforeEach(() => {
		prepareMocks();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	const cookies = () => ({
		get() { return undefined },
		getAll() { return [] },
		has() { return false },
	}) as any;

	describe('typings', () => {
		/**
		 * Static / Type tests only.
		 * 
		 * (No executed intended or expected.)
		 */

		describe('without a custom endpoint', () => {
			test("do not require `authMode` or `apiKey` override", () => {
				// expect no type error
				() => generateServerClientUsingCookies({
					config: Amplify.getConfig(),
					cookies
				});
			});
	
			test("do not require `authMode` or `apiKey` override in client.graphql()", () => {
				async () => {
					const client = generateServerClientUsingCookies({
						config: Amplify.getConfig(),
						cookies
					});
					await client.graphql({ query: `query A { queryA { a b c } }` });
				}
			});
	
			test("allows `authMode` override in client", () => {
				async () => {
					const client = generateServerClientUsingCookies({
						config: Amplify.getConfig(),
						cookies,
						authMode: 'userPool',
					});
		
					await client.graphql({
						query: `query A { queryA { a b c } }`,
					});
				}
			});
	
			test("allow `authMode` override in `client.graphql()`", () => {
				async () => {
					const client = generateServerClientUsingCookies({
						config: Amplify.getConfig(),
						cookies,
					});
		
					await client.graphql({
						query: `query A { queryA { a b c } }`,
						authMode: 'userPool',
					});
				}
			});
	
			test("allows `apiKey` override in `client.graphql()`", () => {
				async () => {
					const client = generateServerClientUsingCookies({
						config: Amplify.getConfig(),
						cookies,
					});
		
					await client.graphql({
						query: `query A { queryA { a b c } }`,
						apiKey: CUSTOM_API_KEY,
					});	
				}
			});
	
			test("allows `authMode` + `apiKey` override in `client.graphql()`", () => {
				async () => {
					const client = generateServerClientUsingCookies({
						config: Amplify.getConfig(),
						cookies,
						authMode: 'userPool'
					});
		
					await client.graphql({
						query: `query A { queryA { a b c } }`,
						authMode: 'apiKey',
						apiKey: CUSTOM_API_KEY,
					});
				}
			});
		})

		describe('with a custom endpoint', () => {
			test("requires `authMode` override", () => {
				// @ts-expect-error
				() => generateServerClientUsingCookies({
					config: Amplify.getConfig(),
					cookies,
					endpoint: CUSTOM_ENDPOINT
				});
			})

			test("requires `apiKey` with `authMode: 'apiKey'` override in client", () => {
				// @ts-expect-error
				() =>  generateServerClientUsingCookies({
					config: Amplify.getConfig(),
					cookies,
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'apiKey',
				});
			});

			test("allows `authMode` override in client", () => {
				async () => {
					const client = generateServerClientUsingCookies({
						config: Amplify.getConfig(),
						cookies,
						endpoint: CUSTOM_ENDPOINT,
						authMode: 'userPool',
					});
		
					await client.graphql({
						query: `query A { queryA { a b c } }`,
					});
				}
			});

			test("allows `authMode: 'none'` override in client.graphql()", () => {
				async () => {
					const client = generateServerClientUsingCookies({
						config: Amplify.getConfig(),
						cookies,
						endpoint: CUSTOM_ENDPOINT,
						authMode: 'none',
					});
		
					await client.graphql({
						query: `query A { queryA { a b c } }`,
					});
				}
			});

			test("allows `authMode: 'apiKey'` + `apiKey` override in client", () => {
				async () => {
					const client = generateServerClientUsingCookies({
						config: Amplify.getConfig(),
						cookies,
						endpoint: CUSTOM_ENDPOINT,
						authMode: 'apiKey',
						apiKey: CUSTOM_API_KEY
					});
		
					await client.graphql({
						query: `query A { queryA { a b c } }`,
					});
				}
			});

			test("allows `authMode` override in client.graphql()", () => {
				async () => {
					const client = generateServerClientUsingCookies({
						config: Amplify.getConfig(),
						cookies,
						endpoint: CUSTOM_ENDPOINT,
						authMode: 'none',
					});
		
					await client.graphql({
						query: `query A { queryA { a b c } }`,
						authMode: 'userPool'
					});
				}
			});

			test("requires `apiKey` with `authMode: 'apiKey'` override in client.graphql()", () => {
				async () => {
					const client = generateServerClientUsingCookies({
						config: Amplify.getConfig(),
						cookies,
						endpoint: CUSTOM_ENDPOINT,
						authMode: 'none',
					});
		
					// @ts-expect-error
					await client.graphql({
						query: `query A { queryA { a b c } }`,
						authMode: 'apiKey'
					});
				}
			});

			test("allows `authMode: 'apiKey'` + `apiKey` override in client.graphql()", () => {
				async () => {
					const client = generateServerClientUsingCookies({
						config: Amplify.getConfig(),
						cookies,
						endpoint: CUSTOM_ENDPOINT,
						authMode: 'none',
					});
		
					await client.graphql({
						query: `query A { queryA { a b c } }`,
						authMode: 'apiKey',
						apiKey: CUSTOM_API_KEY
					});
				}
			});
		})

	});
});

describe('generateClient (req/res client)', () => {

	/**
	 * NOTICE
	 * 
	 * ReqRes client is largely a pass-thru to `server/generateClient`, which is a pass-thru
	 * to `generateClientWithAmplifyInstance` (with add Amplify instance).
	 * 
	 * These tests intend to cover narrowing rules on the public surface. Behavior is
	 * tested in the `SSR common` describe block.
	 */
	
	beforeEach(() => {
		prepareMocks();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	const cookies = () => ({
		get() { return undefined },
		getAll() { return [] },
		has() { return false },
	}) as any;

	const contextSpec = {} as any;

	describe('typings', () => {
		/**
		 * Static / Type tests only.
		 * 
		 * (No executed intended or expected.)
		 */

		describe('without a custom endpoint', () => {
			test("do not require `authMode` or `apiKey` override", () => {
				// expect no type error
				() => generateServerClientUsingReqRes({
					config: Amplify.getConfig(),
				});
			});
	
			test("do not require `authMode` or `apiKey` override in client.graphql()", () => {
				async () => {
					const client = generateServerClientUsingReqRes({
						config: Amplify.getConfig(),
					});
					await client.graphql(contextSpec, { query: `query A { queryA { a b c } }` });
				}
			});
	
			test("allows `authMode` override in client", () => {
				async () => {
					const client = generateServerClientUsingReqRes({
						config: Amplify.getConfig(),
						authMode: 'userPool',
					});
		
					await client.graphql(contextSpec, {
						query: `query A { queryA { a b c } }`,
					});
				}
			});
	
			test("allow `authMode` override in `client.graphql()`", () => {
				async () => {
					const client = generateServerClientUsingReqRes({
						config: Amplify.getConfig(),
					});
		
					await client.graphql(contextSpec, {
						query: `query A { queryA { a b c } }`,
						authMode: 'userPool',
					});
				}
			});
	
			test("allows `apiKey` override in `client.graphql()`", () => {
				async () => {
					const client = generateServerClientUsingReqRes({
						config: Amplify.getConfig(),
					});
		
					await client.graphql(contextSpec, {
						query: `query A { queryA { a b c } }`,
						apiKey: CUSTOM_API_KEY,
					});	
				}
			});
	
			test("allows `authMode` + `apiKey` override in `client.graphql()`", () => {
				async () => {
					const client = generateServerClientUsingReqRes({
						config: Amplify.getConfig(),
						authMode: 'userPool'
					});
		
					await client.graphql(contextSpec, {
						query: `query A { queryA { a b c } }`,
						authMode: 'apiKey',
						apiKey: CUSTOM_API_KEY,
					});
				}
			});
		})

		describe('with a custom endpoint', () => {
			test("requires `authMode` override", () => {
				// @ts-expect-error
				() => generateServerClientUsingReqRes({
					config: Amplify.getConfig(),
					endpoint: CUSTOM_ENDPOINT
				});
			})

			test("requires `apiKey` with `authMode: 'apiKey'` override in client", () => {
				// @ts-expect-error
				() =>  generateServerClientUsingReqRes({
					config: Amplify.getConfig(),
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'apiKey',
				});
			});

			test("allows `authMode` override in client", () => {
				async () => {
					const client = generateServerClientUsingReqRes({
						config: Amplify.getConfig(),
						endpoint: CUSTOM_ENDPOINT,
						authMode: 'userPool',
					});
		
					await client.graphql(contextSpec, {
						query: `query A { queryA { a b c } }`,
					});
				}
			});

			test("allows `authMode: 'none'` override in client.graphql()", () => {
				async () => {
					const client = generateServerClientUsingReqRes({
						config: Amplify.getConfig(),
						endpoint: CUSTOM_ENDPOINT,
						authMode: 'none',
					});
		
					await client.graphql(contextSpec, {
						query: `query A { queryA { a b c } }`,
					});
				}
			});

			test("allows `authMode: 'apiKey'` + `apiKey` override in client", () => {
				async () => {
					const client = generateServerClientUsingReqRes({
						config: Amplify.getConfig(),
						endpoint: CUSTOM_ENDPOINT,
						authMode: 'apiKey',
						apiKey: CUSTOM_API_KEY
					});
		
					await client.graphql(contextSpec, {
						query: `query A { queryA { a b c } }`,
					});
				}
			});

			test("allows `authMode` override in client.graphql()", () => {
				async () => {
					const client = generateServerClientUsingReqRes({
						config: Amplify.getConfig(),
						endpoint: CUSTOM_ENDPOINT,
						authMode: 'none',
					});
		
					await client.graphql(contextSpec, {
						query: `query A { queryA { a b c } }`,
						authMode: 'userPool'
					});
				}
			});

			test("requires `apiKey` with `authMode: 'apiKey'` override in client.graphql()", () => {
				async () => {
					const client = generateServerClientUsingReqRes({
						config: Amplify.getConfig(),
						endpoint: CUSTOM_ENDPOINT,
						authMode: 'none',
					});
		
					// @ts-expect-error
					await client.graphql(contextSpec, {
						query: `query A { queryA { a b c } }`,
						authMode: 'apiKey'
					});
				}
			});

			test("allows `authMode: 'apiKey'` + `apiKey` override in client.graphql()", () => {
				async () => {
					const client = generateServerClientUsingReqRes({
						config: Amplify.getConfig(),
						endpoint: CUSTOM_ENDPOINT,
						authMode: 'none',
					});
		
					await client.graphql(contextSpec, {
						query: `query A { queryA { a b c } }`,
						authMode: 'apiKey',
						apiKey: CUSTOM_API_KEY
					});
				}
			});
		})

	});
});

describe('SSR common', () => {
	/**
	 * NOTICE
	 * 
	 * This tests the runtime validation behavior common to both SSR clients.
	 * 
	 * 1. Cookie client uses `generateClientWithAmplifyInstance` directly.
	 * 2. ReqRest client uses `server/generateClient`.
	 * 3. `server/generateClient` is a pass-thru to `generateClientWithAmplifyInstance` that
	 * injects an `Amplify` instance.
	 * 
	 * The runtime validations we need to check funnel through `generateClientWithAmplifyInstance`.
	 */

	beforeEach(() => {
		prepareMocks();
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	for (const op of ['query', 'subscription'] as const) {
		const opType = op === 'subscription' ? 'sub' : 'qry';

		describe(`[${opType}] without a custom endpoint`, () => {
			test("does not require `authMode` or `apiKey` override", () => {
				expect(() => generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
				})).not.toThrow();
			});

			test("does not require `authMode` or `apiKey` override in client.graphql()", async () => {
				const client = generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
				});

				await client.graphql({ query: `${op} A { queryA { a b c } }` });
	
				expectOp({
					op,
					endpoint: DEFAULT_ENDPOINT,
					authMode: DEFAULT_AUTH_MODE,
				});
			});

			test("allows `authMode` override in client", async () => {
				const client = generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
					authMode: 'userPool',
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
				});
	
				expectOp({
					op,
					endpoint: DEFAULT_ENDPOINT,
					authMode: 'userPool',
				});
			});

			test("allows `authMode` override in `client.graphql()`", async () => {
				const client = generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
					authMode: 'userPool',
				});
	
				expectOp({
					op,
					endpoint: DEFAULT_ENDPOINT,
					authMode: 'userPool',
				});
			});

			test("allows `apiKey` override in `client.graphql()`", async () => {
				const client = generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
					apiKey: CUSTOM_API_KEY,
				});
	
				expectOp({
					op,
					endpoint: DEFAULT_ENDPOINT,
					authMode: 'apiKey',
					apiKeyOverride: CUSTOM_API_KEY
				});
			});

			test("allows `authMode` + `apiKey` override in `client.graphql()`", async () => {
				const client = generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
					authMode: 'userPool'
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
					authMode: 'apiKey',
					apiKey: CUSTOM_API_KEY,
				});
	
				expectOp({
					op,
					endpoint: DEFAULT_ENDPOINT,
					authMode: 'apiKey',
					apiKeyOverride: CUSTOM_API_KEY
				});
			});
		});

		describe(`[${opType}] with a custom endpoint`, () => {
			test("requires `authMode` override", () => {
				// @ts-expect-error
				expect(() => generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
					endpoint: CUSTOM_ENDPOINT
				})).toThrow()
			})

			test("requires `apiKey` with `authMode: 'apiKey'` override in client", async () => {
				// @ts-expect-error
				expect(() =>  generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'apiKey',
				})).toThrow();
			});

			test("allows `authMode` override in client", async () => {
				const client = generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
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

			test("allows `authMode: 'none'` override in client.graphql()", async () => {
				const client = generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'none',
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
				});
	
				expectOp({
					op,
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'none',
				});
			});

			test("allows `authMode: 'apiKey'` + `apiKey` override in client", async () => {
				const client = generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'apiKey',
					apiKey: CUSTOM_API_KEY
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
				});
	
				expectOp({
					op,
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'apiKey',
					apiKeyOverride: CUSTOM_API_KEY
				});
			});

			test("allows `authMode` override in client.graphql()", async () => {
				const client = generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: {},
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'none',
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
					authMode: 'userPool'
				});
	
				expectOp({
					op,
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'userPool',
				});
			});

			test("requires `apiKey` with `authMode: 'apiKey'` override in client.graphql()", async () => {
				// no TS expect error here. types for `generateClientWithAmplifyInstance` have been simplified
				// because they are not customer-facing.
				const client = generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'none',
				});
	
				expect(() => client.graphql({
					query: `${op} A { queryA { a b c } }`,
					authMode: 'apiKey'
				})).toThrow()
			});

			test("allows `authMode: 'apiKey'` + `apiKey` override in client.graphql()", async () => {
				const client = generateClientWithAmplifyInstance({
					amplify: Amplify as any,
					config: Amplify.getConfig(),
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'none',
				});
	
				await client.graphql({
					query: `${op} A { queryA { a b c } }`,
					authMode: 'apiKey',
					apiKey: CUSTOM_API_KEY
				});
	
				expectOp({
					op,
					endpoint: CUSTOM_ENDPOINT,
					authMode: 'apiKey',
					apiKeyOverride: CUSTOM_API_KEY
				});
			});
		})
	};
})

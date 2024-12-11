import { ResourcesConfig } from 'aws-amplify';
import { GraphQLAPI } from '@aws-amplify/api-graphql';
import { generateClient, CONNECTION_STATE_CHANGE } from '@aws-amplify/api';
import { AmplifyClassV6 } from '@aws-amplify/core';
import { Observable } from 'rxjs';

const API_KEY = 'FAKE-KEY';

const DEFAULT_ENDPOINT = 'https://a-default-appsync-endpoint.local/graphql';
const CUSTOM_ENDPOINT = 'https://a-custom-appsync-endpoint.local/graphql';

const _postSpy = jest.spyOn((GraphQLAPI as any)._api, 'post');
const _subspy = jest.spyOn((GraphQLAPI as any).appSyncRealTime, 'subscribe');

/**
 * Validates that a "post" occurred (against `_postSpy`) to the given endpoint URL
 * specifically with or without the given `apiKey` (defaults to globally configured
 * `API_KEY`) depending on the given `withApiKey` argument.
 *
 * @param options
 */
function expectPost({
	endpoint,
	withApiKey,
	apiKey = API_KEY,
}: {
	endpoint: string;
	withApiKey: boolean;
	apiKey?: string;
}) {
	expect(_postSpy).toHaveBeenCalledWith(
		expect.anything(), // amplify instance
		expect.objectContaining({
			options: expect.objectContaining({
				headers: withApiKey
					? expect.objectContaining({
							'X-Api-Key': apiKey,
						})
					: expect.not.objectContaining({
							'X-Api-Key': apiKey,
						}),
			}),
			// `url` is an instance of `URL`
			url: expect.objectContaining({
				href: endpoint,
			}),
		}),
	);
}

/**
 * Validates that a "post" occurred (against `_postSpy`) to the given endpoint URL
 * specifically with or without the given `apiKey` (defaults to globally configured
 * `API_KEY`) depending on the given `withApiKey` argument.
 *
 * @param options
 */
function expectSubscription({
	endpoint,
	withApiKey,
	apiKey = API_KEY,
}: {
	endpoint: string;
	withApiKey: boolean;
	apiKey?: string;
}) {
	expect(_subspy).toHaveBeenCalledWith(
		expect.objectContaining({
			appSyncGraphqlEndpoint: endpoint,
		}),
		expect.anything(),
	);

	if (apiKey) {
		expect(_subspy).toHaveBeenCalledWith(
			expect.objectContaining({ apiKey }),
			expect.anything(),
		);
	} else {
		expect(_subspy).toHaveBeenCalledWith(
			expect.not.objectContaining({ apiKey }),
			expect.anything(),
		);
	}
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
		jest.spyOn(AmplifyClassV6.prototype, 'getConfig').mockImplementation(() => {
			return {
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: API_KEY,
						endpoint: DEFAULT_ENDPOINT,
						region: 'north-pole-7',
					},
				},
			};
		});
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

	for (const op of ['query', 'subscription']) {
		const expectOp = op === 'subscription' ? expectSubscription : expectPost;
		const opType = op === 'subscription' ? 'sub' : 'qry';

		test(`client { endpoint: N, authMode: N } + ${opType} { authMode: N } -> config.authMode`, async () => {
			const client = generateClient();

			await client.graphql({ query: `${op} A { queryA { a b c } }` });

			expectOp({
				endpoint: DEFAULT_ENDPOINT,
				withApiKey: true,
			});
		});

		test(`client { endpoint: N, authMode: N } + ${opType} { authMode: Y } -> op.authMode`, async () => {
			const client = generateClient();

			await client.graphql({
				query: `${op} A { queryA { a b c } }`,
				authMode: 'none',
			});

			expectOp({
				endpoint: DEFAULT_ENDPOINT,
				withApiKey: false, // from op.authMode = none
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
				endpoint: DEFAULT_ENDPOINT,
				withApiKey: false, // from client.authMode = none
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
				endpoint: DEFAULT_ENDPOINT,
				withApiKey: false, // from op.authMode = none
			});
		});

		test(`client { endpoint: Y, authMode: N } + ${opType} { authMode: N } -> none (defaulted)`, async () => {
			const client = generateClient({
				endpoint: CUSTOM_ENDPOINT,
			});

			await client.graphql({
				query: `${op} A { queryA { a b c } }`,
			});

			expectOp({
				endpoint: CUSTOM_ENDPOINT,
				withApiKey: false, // from client.endpoint -> default = none
			});
		});

		test(`client { endpoint: Y, authMode: N } + ${opType} { authMode: Y } -> op.authMode`, async () => {
			const client = generateClient({
				endpoint: CUSTOM_ENDPOINT,
			});

			await client.graphql({
				query: `${op} A { queryA { a b c } }`,
				authMode: 'apiKey',
			});

			expectOp({
				endpoint: CUSTOM_ENDPOINT,
				withApiKey: true, // from op.authMode = apiKey
			});
		});

		test(`client { endpoint: Y, authMode: Y } + ${opType} { authMode: N } -> client.authMode`, async () => {
			const client = generateClient({
				endpoint: CUSTOM_ENDPOINT,
				authMode: 'apiKey',
			});

			await client.graphql({
				query: `${op} A { queryA { a b c } }`,
			});

			expectOp({
				endpoint: CUSTOM_ENDPOINT,
				withApiKey: true, // from client.authMode = apiKey
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
				endpoint: CUSTOM_ENDPOINT,
				withApiKey: true, // from op.authMode = apiKey
			});
		});
	}
});

import * as raw from '../src';
import { graphql, cancel } from '../src/internals/v6';
import { Amplify } from '@aws-amplify/core';
import * as typedQueries from './fixtures/with-types/queries';
import { expectGet } from './utils/expects';

import { GraphQLResult, GraphQLAuthError, V6Client } from '../src/types';
import { GetThreadQuery } from './fixtures/with-types/API';

const serverManagedFields = {
	id: 'some-id',
	owner: 'wirejobviously',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

/**
 * Partial mock of the Amplify core module - only mock fetchAuthSession
 */
jest.mock('@aws-amplify/core', () => {
	const originalModule = jest.requireActual('@aws-amplify/core');

	return {
		__esModule: true,
		...originalModule,
		fetchAuthSession: jest.fn(() => {
			return {
				tokens: {
					accessToken: {
						toString: () => 'mock-access-token',
					},
				},
				credentials: {
					accessKeyId: 'mock-access-key-id',
					secretAccessKey: 'mock-secret-access-key',
				},
			};
		}),
	};
});

afterEach(() => {
	jest.restoreAllMocks();
});

describe('API test', () => {
	// NOTE: `generateClient()` is only exported from top-level API category.
	const client = { graphql, cancel } as V6Clientw;

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('graphql test', () => {
		test('happy-case-query', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: 'FAKE-KEY',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const threadToGet = {
				id: 'some-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-id' };

			const graphqlResponse = {
				data: {
					getThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToGet,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockReturnValue({
					body: {
						json: () => graphqlResponse,
					},
				});

			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'apiKey',
			});

			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expectGet(spy, 'getThread', graphqlVariables);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
		});

		test('cancel-graphql-query', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: 'FAKE-KEY',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			jest
				.spyOn((raw.GraphQLAPI as any)._api, 'cancelREST')
				.mockReturnValue(true);

			const request = Promise.resolve();
			expect(client.cancel(request)).toBe(true);
		});

		test('happy-case-query-oidc', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'oidc',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const threadToGet = {
				id: 'some-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-id' };

			const graphqlResponse = {
				data: {
					getThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToGet,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockReturnValue({
					body: {
						json: () => graphqlResponse,
					},
				});

			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'oidc',
			});

			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
			expect(spy).toHaveBeenCalledWith({
				abortController: expect.any(AbortController),
				url: new URL('https://localhost/graphql'),
				options: expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'mock-access-token',
					}),
					signingServiceInfo: expect.objectContaining({
						region: 'local-host-h4x',
						service: 'appsync',
					}),
				}),
			});
		});

		// TODO:
		// test('happy-case-query-oidc with auth storage federated token', async () => {
		// 	const spyonCredentials = jest
		// 		.spyOn(Credentials, 'get')
		// 		.mockImplementationOnce(() => {
		// 			return new Promise((res, rej) => {
		// 				res('cred');
		// 			});
		// 		});

		// 	const cache_config = {
		// 		capacityInBytes: 3000,
		// 		itemMaxSize: 800,
		// 		defaultTTL: 3000000,
		// 		defaultPriority: 5,
		// 		warningThreshold: 0.8,
		// 		storage: window.localStorage,
		// 	};

		// 	Cache.configure(cache_config);

		// 	const spyonCache = jest
		// 		.spyOn(Cache, 'getItem')
		// 		.mockImplementationOnce(() => {
		// 			return null;
		// 		});

		// 	const spyonAuth = jest
		// 		.spyOn(InternalAuth, 'currentAuthenticatedUser')
		// 		.mockImplementationOnce(() => {
		// 			return new Promise((res, rej) => {
		// 				res({
		// 					name: 'federated user',
		// 					token: 'federated_token_from_storage',
		// 				});
		// 			});
		// 		});

		// 	const spyon = jest
		// 		.spyOn(RestClient.prototype, 'post')
		// 		.mockImplementationOnce((url, init) => {
		// 			return new Promise((res, rej) => {
		// 				res({});
		// 			});
		// 		});

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };
		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'OPENID_CONNECT',
		// 	});

		// 	const headers = {
		// 		Authorization: 'federated_token_from_storage',
		// 		// 'x-amz-user-agent': expectedUserAgentFrameworkOnly,
		// 	};

		// 	const body = {
		// 		query: getEventQuery,
		// 		variables,
		// 	};

		// 	const init = {
		// 		headers,
		// 		body,
		// 		signerServiceInfo: {
		// 			service: 'appsync',
		// 			region,
		// 		},
		// 		cancellableToken: mockCancellableToken,
		// 	};

		// 	await api.graphql(graphqlOperation(GetEvent, variables));

		// 	expect(spyon).toBeCalledWith(url, init);

		// 	spyonCredentials.mockClear();
		// 	spyonCache.mockClear();
		// 	spyonAuth.mockClear();
		// });

		test('happy case query with AWS_LAMBDA', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'lambda',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const threadToGet = {
				id: 'some-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-id' };

			const graphqlResponse = {
				data: {
					getThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToGet,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockReturnValue({
					body: {
						json: () => graphqlResponse,
					},
				});

			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'lambda',
				authToken: 'myAuthToken',
			});

			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
			expect(spy).toHaveBeenCalledWith({
				abortController: expect.any(AbortController),
				url: new URL('https://localhost/graphql'),
				options: expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'myAuthToken',
					}),
					signingServiceInfo: expect.objectContaining({
						region: 'local-host-h4x',
						service: 'appsync',
					}),
				}),
			});
		});

		// TODO: implement after custom user agent work is complete
		// test('additional headers with AWS_LAMBDA', async () => {
		// 	expect.assertions(1);

		// 	const spyon = jest
		// 		.spyOn(RestClient.prototype, 'post')
		// 		.mockReturnValue(Promise.resolve({}));

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com';
		// 	const region = 'us-east-2';
		// 	const variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'AWS_LAMBDA',
		// 	});

		// 	const headers = {
		// 		// 'x-amz-user-agent': expectedUserAgentFrameworkOnly,
		// 		Authorization: 'myAuthToken',
		// 	};

		// 	const body = {
		// 		query: getEventQuery,
		// 		variables,
		// 	};

		// 	const init = {
		// 		headers,
		// 		body,
		// 		signerServiceInfo: {
		// 			service: 'appsync',
		// 			region,
		// 		},
		// 		cancellableToken: mockCancellableToken,
		// 	};

		// 	await api.graphql(
		// 		{
		// 			query: GetEvent,
		// 			variables,
		// 			authToken: 'myAuthToken',
		// 		},
		// 		{ Authorization: 'anotherAuthToken' }
		// 	);

		// 	expect(spyon).toBeCalledWith(url, init);
		// });

		test('multi-auth default case AWS_IAM, using API_KEY as auth mode', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'iam',
						apiKey: 'FAKE-KEY',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const threadToGet = {
				id: 'some-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-id' };

			const graphqlResponse = {
				data: {
					getThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToGet,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockReturnValue({
					body: {
						json: () => graphqlResponse,
					},
				});

			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'apiKey',
			});

			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
			expect(spy).toHaveBeenCalledWith({
				abortController: expect.any(AbortController),
				url: new URL('https://localhost/graphql'),
				options: expect.objectContaining({
					headers: expect.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
					signingServiceInfo: expect.objectContaining({
						region: 'local-host-h4x',
						service: 'appsync',
					}),
				}),
			});
		});

		test('multi-auth default case api-key, using AWS_IAM as auth mode', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: 'FAKE-KEY',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const threadToGet = {
				id: 'some-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-id' };

			const graphqlResponse = {
				data: {
					getThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToGet,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockReturnValue({
					body: {
						json: () => graphqlResponse,
					},
				});

			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'iam',
			});

			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);

			expect(spy).toHaveBeenCalledWith({
				abortController: expect.any(AbortController),
				url: new URL('https://localhost/graphql'),
				options: expect.objectContaining({
					headers: expect.not.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
					signingServiceInfo: expect.objectContaining({
						region: 'local-host-h4x',
						service: 'appsync',
					}),
				}),
			});
		});

		test('multi-auth default case api-key, using AWS_LAMBDA as auth mode', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: 'FAKE-KEY',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const threadToGet = {
				id: 'some-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-id' };

			const graphqlResponse = {
				data: {
					getThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToGet,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockReturnValue({
					body: {
						json: () => graphqlResponse,
					},
				});

			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'lambda',
				authToken: 'myAuthToken',
			});

			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
			expect(spy).toHaveBeenCalledWith({
				abortController: expect.any(AbortController),
				url: new URL('https://localhost/graphql'),
				options: expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'myAuthToken',
					}),
					signingServiceInfo: expect.objectContaining({
						region: 'local-host-h4x',
						service: 'appsync',
					}),
				}),
			});
		});

		test('multi-auth default case api-key, using OIDC as auth mode', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: 'FAKE-KEY',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const threadToGet = {
				id: 'some-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-id' };

			const graphqlResponse = {
				data: {
					getThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToGet,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockReturnValue({
					body: {
						json: () => graphqlResponse,
					},
				});

			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'oidc',
			});

			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
			expect(spy).toHaveBeenCalledWith({
				abortController: expect.any(AbortController),
				url: new URL('https://localhost/graphql'),
				options: expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'mock-access-token',
					}),
					signingServiceInfo: expect.objectContaining({
						region: 'local-host-h4x',
						service: 'appsync',
					}),
				}),
			});
		});

		// TODO: make this fail without `Cache`?
		test.skip('multi-auth default case api-key, OIDC as auth mode, but no federatedSign', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: 'FAKE-KEY',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const threadToGet = {
				id: 'some-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-id' };

			const graphqlResponse = {
				data: {
					getThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToGet,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockReturnValue({
					body: {
						json: () => graphqlResponse,
					},
				});

			await expect(
				client.graphql({
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'oidc',
				})
			).rejects.toThrowError('No current user');
		});

		// TODO:
		test.skip('multi-auth using CUP as auth mode, but no userpool', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: 'FAKE-KEY',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const graphqlVariables = { id: 'some-id' };

			await expect(
				client.graphql({
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'userPool',
				})
			).rejects.toThrow();
		});

		it('AWS_LAMBDA as auth mode, but no auth token specified', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'lambda',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const graphqlVariables = { id: 'some-id' };

			await expect(
				client.graphql({
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'lambda',
				})
			).rejects.toThrowError(GraphQLAuthError.NO_AUTH_TOKEN);
		});

		test('multi-auth using API_KEY as auth mode, but no api-key configured', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'iam',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const graphqlVariables = { id: 'some-id' };

			await expect(
				client.graphql({
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'apiKey',
				})
			).rejects.toThrowError(GraphQLAuthError.NO_API_KEY);
		});

		// TODO:
		test.skip('multi-auth using AWS_IAM as auth mode, but no credentials', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: 'fake-api-key',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const graphqlVariables = { id: 'some-id' };

			await expect(
				client.graphql({
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'iam',
				})
			).rejects.toThrowError(GraphQLAuthError.NO_API_KEY);
		});

		test('multi-auth default case api-key, using CUP as auth mode', async () => {
			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: 'FAKE-KEY',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const threadToGet = {
				id: 'some-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-id' };

			const graphqlResponse = {
				data: {
					getThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToGet,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockReturnValue({
					body: {
						json: () => graphqlResponse,
					},
				});

			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'userPool',
			});

			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
			expect(spy).toHaveBeenCalledWith({
				abortController: expect.any(AbortController),
				url: new URL('https://localhost/graphql'),
				options: expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'mock-access-token',
					}),
					signingServiceInfo: expect.objectContaining({
						region: 'local-host-h4x',
						service: 'appsync',
					}),
				}),
			});
		});

		// TODO:
		// test('authMode on subscription', async () => {
		// 	expect.assertions(1);

		// 	jest
		// 		.spyOn(RestClient.prototype, 'post')
		// 		.mockImplementation(async (url, init) => ({
		// 			extensions: {
		// 				subscription: {
		// 					newSubscriptions: {},
		// 				},
		// 			},
		// 		}));

		// 	const cache_config = {
		// 		capacityInBytes: 3000,
		// 		itemMaxSize: 800,
		// 		defaultTTL: 3000000,
		// 		defaultPriority: 5,
		// 		warningThreshold: 0.8,
		// 		storage: window.localStorage,
		// 	};

		// 	Cache.configure(cache_config);

		// 	jest.spyOn(Cache, 'getItem').mockReturnValue({ token: 'id_token' });

		// 	const spyon_pubsub = jest
		// 		.spyOn(InternalPubSub, 'subscribe')
		// 		.mockImplementation(jest.fn(() => Observable.of({}) as any));

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		apiKey = 'secret_api_key',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'API_KEY',
		// 		aws_appsync_apiKey: apiKey,
		// 	});

		// 	const SubscribeToEventComments = `subscription SubscribeToEventComments($eventId: String!) {
		// 		subscribeToEventComments(eventId: $eventId) {
		// 			eventId
		// 			commentId
		// 			content
		// 		}
		// 	}`;

		// 	const doc = parse(SubscribeToEventComments);
		// 	const query = print(doc);

		// 	(
		// 		api.graphql({
		// 			query,
		// 			variables,
		// 			authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT,
		// 		}) as any
		// 	).subscribe();

		// 	expect(spyon_pubsub).toBeCalledWith(
		// 		'',
		// 		expect.objectContaining({
		// 			authenticationType: 'OPENID_CONNECT',
		// 		}),
		// 		undefined
		// 	);
		// });

		// TODO:
		// test('happy-case-subscription', async done => {
		// 	jest
		// 		.spyOn(RestClient.prototype, 'post')
		// 		.mockImplementation(async (url, init) => ({
		// 			extensions: {
		// 				subscription: {
		// 					newSubscriptions: {},
		// 				},
		// 			},
		// 		}));

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		apiKey = 'secret_api_key',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'API_KEY',
		// 		aws_appsync_apiKey: apiKey,
		// 	});

		// 	InternalPubSub.subscribe = jest.fn(() => Observable.of({}) as any);

		// 	const SubscribeToEventComments = `subscription SubscribeToEventComments($eventId: String!) {
		// 		subscribeToEventComments(eventId: $eventId) {
		// 			eventId
		// 			commentId
		// 			content
		// 		}
		// 	}`;

		// 	const doc = parse(SubscribeToEventComments);
		// 	const query = print(doc);

		// 	const observable = (
		// 		api.graphql(
		// 			graphqlOperation(query, variables)
		// 		) as unknown as Observable<object>
		// 	).subscribe({
		// 		next: () => {
		// 			expect(InternalPubSub.subscribe).toHaveBeenCalledTimes(1);
		// 			const subscribeOptions = (InternalPubSub.subscribe as any).mock
		// 				.calls[0][1];
		// 			expect(subscribeOptions.provider).toBe(
		// 				INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER
		// 			);
		// 			done();
		// 		},
		// 	});

		// 	expect(observable).not.toBe(undefined);
		// });

		// TODO:
		// test('happy case subscription with additionalHeaders', async done => {
		// 	jest
		// 		.spyOn(RestClient.prototype, 'post')
		// 		.mockImplementation(async (url, init) => ({
		// 			extensions: {
		// 				subscription: {
		// 					newSubscriptions: {},
		// 				},
		// 			},
		// 		}));

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		apiKey = 'secret_api_key',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'API_KEY',
		// 		aws_appsync_apiKey: apiKey,
		// 	});

		// 	InternalPubSub.subscribe = jest.fn(() => Observable.of({}) as any);

		// 	const SubscribeToEventComments = `subscription SubscribeToEventComments($eventId: String!) {
		// 		subscribeToEventComments(eventId: $eventId) {
		// 			eventId
		// 			commentId
		// 			content
		// 		}
		// 	}`;

		// 	const doc = parse(SubscribeToEventComments);
		// 	const query = print(doc);

		// 	const additionalHeaders = {
		// 		'x-custom-header': 'value',
		// 	};

		// 	const observable = (
		// 		api.graphql(
		// 			graphqlOperation(query, variables),
		// 			additionalHeaders
		// 		) as unknown as Observable<object>
		// 	).subscribe({
		// 		next: () => {
		// 			expect(InternalPubSub.subscribe).toHaveBeenCalledTimes(1);
		// 			const subscribeOptions = (InternalPubSub.subscribe as any).mock
		// 				.calls[0][1];
		// 			expect(subscribeOptions.additionalHeaders).toBe(additionalHeaders);
		// 			done();
		// 		},
		// 	});

		// 	expect(observable).not.toBe(undefined);
		// });

		// TODO:
		// test('happy case mutation', async () => {
		// 	const spyonAuth = jest
		// 		.spyOn(Credentials, 'get')
		// 		.mockImplementationOnce(() => {
		// 			return new Promise((res, rej) => {
		// 				res('cred');
		// 			});
		// 		});

		// 	const spyon = jest
		// 		.spyOn(RestClient.prototype, 'post')
		// 		.mockImplementationOnce((url, init) => {
		// 			return new Promise((res, rej) => {
		// 				res({});
		// 			});
		// 		});
		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		apiKey = 'secret_api_key',
		// 		variables = {
		// 			id: '809392da-ec91-4ef0-b219-5238a8f942b2',
		// 			content: 'lalala',
		// 			createdAt: new Date().toISOString(),
		// 		};
		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'API_KEY',
		// 		aws_appsync_apiKey: apiKey,
		// 	});
		// 	const AddComment = `mutation AddComment($eventId: ID!, $content: String!, $createdAt: String!) {
		// 		commentOnEvent(eventId: $eventId, content: $content, createdAt: $createdAt) {
		// 			eventId
		// 			content
		// 			createdAt
		// 		}
		// 	}`;

		// 	const doc = parse(AddComment);
		// 	const query = print(doc);

		// 	const headers = {
		// 		Authorization: null,
		// 		'X-Api-Key': apiKey,
		// 		// 'x-amz-user-agent': expectedUserAgentFrameworkOnly,
		// 	};

		// 	const body = {
		// 		query,
		// 		variables,
		// 	};

		// 	const init = {
		// 		headers,
		// 		body,
		// 		signerServiceInfo: {
		// 			service: 'appsync',
		// 			region,
		// 		},
		// 		cancellableToken: mockCancellableToken,
		// 	};

		// 	await api.graphql(graphqlOperation(AddComment, variables));

		// 	expect(spyon).toBeCalledWith(url, init);
		// });

		test('happy case query with additionalHeaders', async () => {
			Amplify.configure(
				{
					API: {
						GraphQL: {
							defaultAuthMode: 'apiKey',
							apiKey: 'FAKE-KEY',
							endpoint: 'https://localhost/graphql',
							region: 'local-host-h4x',
						},
					},
				},
				{
					API: {
						GraphQL: {
							headers: async () =>
								Promise.resolve({
									someHeaderSetAtConfigThatWillBeOverridden: 'initialValue',
									someOtherHeaderSetAtConfig: 'expectedValue',
								}),
						},
					},
				}
			);

			const threadToGet = {
				id: 'some-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-id' };

			const graphqlResponse = {
				data: {
					getThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToGet,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockReturnValue({
					body: {
						json: () => graphqlResponse,
					},
				});

			const additionalHeaders = {
				someAdditionalHeader: 'foo',
				someHeaderSetAtConfigThatWillBeOverridden: 'expectedValue',
			};

			const result: GraphQLResult<GetThreadQuery> = await client.graphql(
				{
					query: typedQueries.getThread,
					variables: graphqlVariables,
				},
				additionalHeaders
			);

			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
			expect(spy).toHaveBeenCalledWith({
				abortController: expect.any(AbortController),
				url: new URL('https://localhost/graphql'),
				options: expect.objectContaining({
					headers: expect.objectContaining({
						someAdditionalHeader: 'foo',
						someHeaderSetAtConfigThatWillBeOverridden: 'expectedValue',
						someOtherHeaderSetAtConfig: 'expectedValue',
					}),
					signingServiceInfo: expect.objectContaining({
						region: 'local-host-h4x',
						service: 'appsync',
					}),
				}),
			});
		});

		// TODO:
		// test('sends cookies with request', async () => {
		// 	const spyonAuth = jest
		// 		.spyOn(Credentials, 'get')
		// 		.mockImplementationOnce(() => {
		// 			return new Promise((res, rej) => {
		// 				res('cred');
		// 			});
		// 		});

		// 	const spyon = jest
		// 		.spyOn(RestClient.prototype, 'post')
		// 		.mockImplementationOnce((url, init) => {
		// 			return new Promise((res, rej) => {
		// 				res({});
		// 			});
		// 		});

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		apiKey = 'secret_api_key',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };
		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'API_KEY',
		// 		aws_appsync_apiKey: apiKey,
		// 		withCredentials: true,
		// 	});

		// 	const headers = {
		// 		Authorization: null,
		// 		'X-Api-Key': apiKey,
		// 		// 'x-amz-user-agent': expectedUserAgentFrameworkOnly,
		// 	};

		// 	const body = {
		// 		query: getEventQuery,
		// 		variables,
		// 	};

		// 	const init = {
		// 		headers,
		// 		body,
		// 		signerServiceInfo: {
		// 			service: 'appsync',
		// 			region,
		// 		},
		// 		cancellableToken: mockCancellableToken,
		// 		withCredentials: true,
		// 	};
		// 	let authToken: undefined;

		// 	await api.graphql(graphqlOperation(GetEvent, variables, authToken));

		// 	expect(spyon).toBeCalledWith(url, init);
		// });
	});
});

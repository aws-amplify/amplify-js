import * as raw from '../src';
import { graphql, cancel } from '../src/internals/v6';
// import { Amplify } from '@aws-amplify/core';
import { Amplify } from '@aws-amplify/core';
// import { fetchAuthSession } from '@aws-amplify/core';
import * as typedQueries from './fixtures/with-types/queries';
import * as typedMutations from './fixtures/with-types/mutations';
import * as typedSubscriptions from './fixtures/with-types/subscriptions';
import * as untypedQueries from './fixtures/without-types/queries';
import * as untypedMutations from './fixtures/without-types/mutations';
import * as untypedSubscriptions from './fixtures/without-types/subscriptions';
import { from } from 'rxjs';
import {
	expectGet,
	expectList,
	expectMutation,
	expectSub,
} from './utils/expects';

import {
	GraphQLResult,
	GraphqlSubscriptionResult,
	GraphqlSubscriptionMessage,
	GraphQLQuery,
	GraphQLSubscription,
} from '../src/types';
import {
	CreateThreadMutation,
	UpdateThreadMutation,
	DeleteThreadMutation,
	GetThreadQuery,
	ListThreadsQuery,
	OnCreateThreadSubscription,
} from './fixtures/with-types/API';

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

	//Mock the default export and named export 'foo'
	return {
		__esModule: true,
		...originalModule,
		// default: jest.fn(() => 'mocked baz'),
		fetchAuthSession: jest.fn(() => {
			// debugger;
			return {
				tokens: {
					accessToken: {
						toString: () => 'test',
					},
				},
				credentials: {
					accessKeyId: 'test',
					secretAccessKey: 'test',
				},
			};
		}),
	};
});

// jest.mock('@aws-amplify/core', () => ({
// 	Amplify: {
// 		getConfig: jest.fn(),
// 		Auth: {
// 			fetchAuthSession: jest.fn(),
// 		},
// 	},
// }));

// import { InternalAuth } from '@aws-amplify/auth/internals';
// import { GraphQLAPIClass as API } from '../src';
// import { InternalGraphQLAPIClass as InternalAPI } from '../src/internals';
// import { graphqlOperation } from '../src/GraphQLAPI';
// import { GraphQLAuthMode } from '@aws-amplify/core/internals/utils';
// import { RestClient } from '@aws-amplify/api-rest';
// import { print } from 'graphql/language/printer';
// import { parse } from 'graphql/language/parser';
// import {
// Credentials,
// Constants,
// INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER,
// Category,
// Framework,
// ApiAction,
// CustomUserAgentDetails,
// } from '@aws-amplify/core';
// import {
// Constants,
// INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER,
// Category,
// Framework,
// ApiAction,
// CustomUserAgentDetails,
// } from '@aws-amplify/core/internals/utils';
// import { InternalPubSub } from '@aws-amplify/pubsub/internals';
// import { Cache } from '@aws-amplify/cache';
// import * as Observable from 'zen-observable';
// import axios, { CancelTokenStatic } from 'axios';

// axios.CancelToken = <CancelTokenStatic>{
// 	source: () => ({ token: null, cancel: null } as any),
// };
// axios.isCancel = (value: any): boolean => {
// 	return false;
// };

// let isCancelSpy;
// let cancelTokenSpy;
// let cancelMock;
// let tokenMock;
// let mockCancellableToken;
// jest.mock('axios');

// const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
// 	getEvent(id: $id) {
// 		id
// 		name
// 		where
// 		when
// 		description
// 		comments(nextToken: $nextToken) {
// 			items {
// 			commentId
// 			content
// 			createdAt
// 			}
// 		}
// 	}
// }`;
// const getEventDoc = parse(GetEvent);
// const getEventQuery = print(getEventDoc);

/* TODO: Test with actual actions */
// const expectedUserAgentFrameworkOnly = `${Constants.userAgent} framework/${Framework.WebUnknown}`;
// const customUserAgentDetailsAPI: CustomUserAgentDetails = {
// 	category: Category.API,
// 	action: ApiAction.GraphQl,
// };
// const expectedUserAgentAPI = `${Constants.userAgent} ${Category.API}/${ApiAction.GraphQl} framework/${Framework.WebUnknown}`;

// TODO
// TODO
// TODO
// TODO
// const mockFetchAuthSession = fetchAuthSession as jest.Mock;
// mockFetchAuthSession.mockResolvedValue({
// 	tokens: {
// 		accessToken: {
// 			toString: () => 'test',
// 		},
// 	},
// 	credentials: {
// 		accessKeyId: 'test',
// 		secretAccessKey: 'test',
// 	},
// });
// TODO
// TODO
// TODO
// TODO
// jest.mock('@aws-amplify/core', () => ({
// 	__esModule: true,
// 	...jest.requireActual('@aws-amplify/core'),
// 	browserOrNode() {
// 		return {
// 			isBrowser: true,
// 			isNode: false,
// 		};
// 	},
// }));

// jest.mock('@aws-amplify/core', () => {
// 	const original = jest.requireActual('@aws-amplify/core');
// 	const session = {
// 		tokens: {
// 			accessToken: {
// 				toString: () => 'test',
// 			},
// 		},
// 		credentials: {
// 			accessKeyId: 'test',
// 			secretAccessKey: 'test',
// 		},
// 	};
// 	return {
// 		...original,
// 		fetchAuthSession: (_request, _options) => {
// 			debugger;
// 			return Promise.resolve(session);
// 		},
// 		Amplify: {
// 			getConfig: jest.fn(),
// 			Auth: {
// 				fetchAuthSession: async () => {
// 					debugger;
// 					return session;
// 				},
// 			},
// 		},
// 	};
// });

// const mockGetConfig = Amplify.getConfig as jest.Mock;
// mockGetConfig.mockReturnValue({
// 	API: {
// 		GraphQL: {
// 			defaultAuthMode: 'apiKey',
// 			apiKey: 'FAKE-KEY',
// 			endpoint: 'https://localhost/graphql',
// 			region: 'local-host-h4x',
// 		},
// 	},
// });

afterEach(() => {
	jest.restoreAllMocks();
});

describe('API test', () => {
	// `generateClient()` is only exported from top-level API category.
	const client = { graphql, cancel };
	// beforeEach(() => {
	// cancelMock = jest.fn();
	// tokenMock = jest.fn();
	// mockCancellableToken = { token: tokenMock, cancel: cancelMock };
	// isCancelSpy = jest.spyOn(axios, 'isCancel').mockReturnValue(true);
	// cancelTokenSpy = jest
	// 	.spyOn(axios.CancelToken, 'source')
	// 	.mockImplementation(() => {
	// 		return mockCancellableToken;
	// 	});
	// });

	// beforeEach(() => {
	// 	Amplify.configure({
	// 		API: {
	// 			GraphQL: {
	// 				defaultAuthMode: 'apiKey',
	// 				apiKey: 'FAKE-KEY',
	// 				endpoint: 'https://localhost/graphql',
	// 				region: 'local-host-h4x',
	// 			},
	// 		},
	// 	});
	// });
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
				id: 'some-thread-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-thread-id' };

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

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'apiKey',
			});

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
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

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'cancelREST')
				.mockReturnValue(true);

			const request = Promise.resolve();
			expect(client.cancel(request)).toBe(true);
		});

		// Cache not available..
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
				id: 'some-thread-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-thread-id' };

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

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'oidc',
			});

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			// expectGet(spy, 'getThread', graphqlVariables);
			// expect(errors).toBe(undefined);
			// expect(thread).toEqual(graphqlResponse.data.getThread);
			expect(spy).toHaveBeenCalledWith({
				abortController: expect.any(AbortController),
				url: new URL('https://localhost/graphql'),
				options: expect.objectContaining({
					headers: expect.objectContaining({ Authorization: 'test' }),
					// body: expect.objectContaining({
					// 	query: expect.stringContaining(`${opName}(id: $id)`),
					// 	variables: expect.objectContaining(item),
					// }),
				}),
			});
		});

		// TODO?
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
			// expect.assertions(1);

			// const spyon = jest
			// 	.spyOn(RestClient.prototype, 'post')
			// 	.mockReturnValue(Promise.resolve({}));

			// const api = new API(config);
			// const client = generateClient();
			// const url = 'https://appsync.amazonaws.com';
			// const region = 'us-east-2';
			// const variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

			// api.configure({
			// 	aws_appsync_graphqlEndpoint: url,
			// 	aws_appsync_region: region,
			// 	aws_appsync_authenticationType: 'AWS_LAMBDA',
			// });

			// const headers = {
			// 	// 'x-amz-user-agent': expectedUserAgentFrameworkOnly,
			// 	Authorization: 'myAuthToken',
			// };

			// const body = {
			// 	query: getEventQuery,
			// 	variables,
			// };

			// const init = {
			// 	headers,
			// 	body,
			// 	signerServiceInfo: {
			// 		service: 'appsync',
			// 		region,
			// 	},
			// 	cancellableToken: mockCancellableToken,
			// };

			// await api.graphql({
			// 	query: GetEvent,
			// 	variables,
			// 	authToken: 'myAuthToken',
			// });

			// expect(spyon).toBeCalledWith(url, init);

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
				id: 'some-thread-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-thread-id' };

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

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'lambda',
				authToken: 'myAuthToken',
			});

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			// expectGet(spy, 'getThread', graphqlVariables);
			// expect(errors).toBe(undefined);
			// expect(thread).toEqual(graphqlResponse.data.getThread);
			expect(spy).toHaveBeenCalledWith({
				abortController: expect.any(AbortController),
				url: new URL('https://localhost/graphql'),
				options: expect.objectContaining({
					headers: expect.objectContaining({ Authorization: 'myAuthToken' }),
					// body: expect.objectContaining({
					// 	query: expect.stringContaining(`${opName}(id: $id)`),
					// 	variables: expect.objectContaining(item),
					// }),
				}),
			});
		});

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

		// test('multi-auth default case AWS_IAM, using API_KEY as auth mode', async () => {
		// 	expect.assertions(1);

		// 	const cache_config = {
		// 		capacityInBytes: 3000,
		// 		itemMaxSize: 800,
		// 		defaultTTL: 3000000,
		// 		defaultPriority: 5,
		// 		warningThreshold: 0.8,
		// 		storage: window.localStorage,
		// 	};

		// 	Cache.configure(cache_config);

		// 	const spyon = jest
		// 		.spyOn(RestClient.prototype, 'post')
		// 		.mockReturnValue(Promise.resolve({}));

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
		// 		apiKey = 'secret-api-key';
		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'AWS_IAM',
		// 		aws_appsync_apiKey: apiKey,
		// 	});

		// 	const headers = {
		// 		Authorization: null,
		// 		'X-Api-Key': 'secret-api-key',
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

		// 	await api.graphql({
		// 		query: GetEvent,
		// 		variables,
		// 		authMode: GRAPHQL_AUTH_MODE.API_KEY,
		// 	});

		// 	expect(spyon).toBeCalledWith(url, init);
		// });

		// test('multi-auth default case api-key, using AWS_IAM as auth mode', async () => {
		// 	expect.assertions(1);
		// 	jest.spyOn(Credentials, 'get').mockReturnValue(Promise.resolve('cred'));

		// 	const spyon = jest
		// 		.spyOn(RestClient.prototype, 'post')
		// 		.mockReturnValue(Promise.resolve({}));

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
		// 		apiKey = 'secret-api-key';
		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'API_KEY',
		// 		aws_appsync_apiKey: apiKey,
		// 	});

		// 	const headers = {
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

		// 	await api.graphql({
		// 		query: GetEvent,
		// 		variables,
		// 		authMode: GRAPHQL_AUTH_MODE.AWS_IAM,
		// 	});

		// 	expect(spyon).toBeCalledWith(url, init);
		// });

		// test('multi-auth default case api-key, using AWS_LAMBDA as auth mode', async () => {
		// 	expect.assertions(1);

		// 	const spyon = jest
		// 		.spyOn(RestClient.prototype, 'post')
		// 		.mockReturnValue(Promise.resolve({}));

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
		// 		apiKey = 'secret-api-key';

		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'API_KEY',
		// 		aws_appsync_apiKey: apiKey,
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

		// 	await api.graphql({
		// 		query: GetEvent,
		// 		variables,
		// 		authMode: GRAPHQL_AUTH_MODE.AWS_LAMBDA,
		// 		authToken: 'myAuthToken',
		// 	});

		// 	expect(spyon).toBeCalledWith(url, init);
		// });

		// test('multi-auth default case api-key, using OIDC as auth mode', async () => {
		// 	expect.assertions(1);
		// 	const cache_config = {
		// 		capacityInBytes: 3000,
		// 		itemMaxSize: 800,
		// 		defaultTTL: 3000000,
		// 		defaultPriority: 5,
		// 		warningThreshold: 0.8,
		// 		storage: window.localStorage,
		// 	};

		// 	Cache.configure(cache_config);

		// 	jest.spyOn(Cache, 'getItem').mockReturnValue({ token: 'oidc_token' });

		// 	const spyon = jest
		// 		.spyOn(RestClient.prototype, 'post')
		// 		.mockReturnValue(Promise.resolve({}));

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
		// 		apiKey = 'secret-api-key';
		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'API_KEY',
		// 		aws_appsync_apiKey: apiKey,
		// 	});

		// 	const headers = {
		// 		Authorization: 'oidc_token',
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

		// 	await api.graphql({
		// 		query: GetEvent,
		// 		variables,
		// 		authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT,
		// 	});

		// 	expect(spyon).toBeCalledWith(url, init);
		// });

		// test('multi-auth using OIDC as auth mode, but no federatedSign', async () => {
		// 	expect.assertions(1);

		// 	const cache_config = {
		// 		capacityInBytes: 3000,
		// 		itemMaxSize: 800,
		// 		defaultTTL: 3000000,
		// 		defaultPriority: 5,
		// 		warningThreshold: 0.8,
		// 		storage: window.localStorage,
		// 	};

		// 	Cache.configure(cache_config);

		// 	jest.spyOn(Cache, 'getItem').mockReturnValue(null);

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
		// 		apiKey = 'secret-api-key';
		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'API_KEY',
		// 		aws_appsync_apiKey: apiKey,
		// 	});

		// 	await expect(
		// 		api.graphql({
		// 			query: GetEvent,
		// 			variables,
		// 			authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT,
		// 		})
		// 	).rejects.toThrowError('No current user');
		// });

		// test('multi-auth using CUP as auth mode, but no userpool', async () => {
		// 	expect.assertions(1);

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
		// 		apiKey = 'secret-api-key';
		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'API_KEY',
		// 		aws_appsync_apiKey: apiKey,
		// 	});

		// 	await expect(
		// 		api.graphql({
		// 			query: GetEvent,
		// 			variables,
		// 			authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
		// 		})
		// 	).rejects.toThrow();
		// });

		// test('multi-auth using AWS_LAMBDA as auth mode, but no auth token specified', async () => {
		// 	expect.assertions(1);

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'AWS_IAM',
		// 	});

		// 	await expect(
		// 		api.graphql({
		// 			query: GetEvent,
		// 			variables,
		// 			authMode: GRAPHQL_AUTH_MODE.AWS_LAMBDA,
		// 		})
		// 	).rejects.toThrowError(GraphQLAuthError.NO_AUTH_TOKEN);
		// });

		// test('multi-auth using API_KEY as auth mode, but no api-key configured', async () => {
		// 	expect.assertions(1);

		// 	const cache_config = {
		// 		capacityInBytes: 3000,
		// 		itemMaxSize: 800,
		// 		defaultTTL: 3000000,
		// 		defaultPriority: 5,
		// 		warningThreshold: 0.8,
		// 		storage: window.localStorage,
		// 	};

		// 	Cache.configure(cache_config);

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };
		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'AWS_IAM',
		// 	});

		// 	await expect(
		// 		api.graphql({
		// 			query: GetEvent,
		// 			variables,
		// 			authMode: GRAPHQL_AUTH_MODE.API_KEY,
		// 		})
		// 	).rejects.toThrowError('No api-key configured');
		// });

		// test('multi-auth using AWS_IAM as auth mode, but no credentials', async () => {
		// 	expect.assertions(1);

		// 	jest.spyOn(Credentials, 'get').mockReturnValue(Promise.reject());

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
		// 		apiKey = 'secret-api-key';
		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'API_KEY',
		// 		aws_appsync_apiKey: apiKey,
		// 	});

		// 	await expect(
		// 		api.graphql({
		// 			query: GetEvent,
		// 			variables,
		// 			authMode: GRAPHQL_AUTH_MODE.AWS_IAM,
		// 		})
		// 	).rejects.toThrowError('No credentials');
		// });

		// test('multi-auth default case api-key, using CUP as auth mode', async () => {
		// 	expect.assertions(1);
		// 	const spyon = jest
		// 		.spyOn(RestClient.prototype, 'post')
		// 		.mockReturnValue(Promise.resolve({}));

		// 	jest.spyOn(InternalAuth, 'currentSession').mockReturnValue({
		// 		getAccessToken: () => ({
		// 			getJwtToken: () => 'Secret-Token',
		// 		}),
		// 	} as any);

		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	const url = 'https://appsync.amazonaws.com',
		// 		region = 'us-east-2',
		// 		variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
		// 		apiKey = 'secret-api-key';
		// 	api.configure({
		// 		aws_appsync_graphqlEndpoint: url,
		// 		aws_appsync_region: region,
		// 		aws_appsync_authenticationType: 'API_KEY',
		// 		aws_appsync_apiKey: apiKey,
		// 	});

		// 	const headers = {
		// 		Authorization: 'Secret-Token',
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

		// 	await api.graphql({
		// 		query: GetEvent,
		// 		variables,
		// 		authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
		// 	});

		// 	expect(spyon).toBeCalledWith(url, init);
		// });

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

		// test('happy case query with additionalHeaders', async () => {
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
		// 		graphql_headers: async () =>
		// 			Promise.resolve({
		// 				someHeaderSetAtConfigThatWillBeOverridden: 'initialValue',
		// 				someOtherHeaderSetAtConfig: 'expectedValue',
		// 			}),
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
		// 	};

		// 	const additionalHeaders = {
		// 		someAddtionalHeader: 'foo',
		// 		someHeaderSetAtConfigThatWillBeOverridden: 'expectedValue',
		// 	};

		// 	await api.graphql(
		// 		graphqlOperation(GetEvent, variables),
		// 		additionalHeaders
		// 	);

		// 	expect(spyon).toBeCalledWith(url, {
		// 		...init,
		// 		headers: {
		// 			someAddtionalHeader: 'foo',
		// 			someHeaderSetAtConfigThatWillBeOverridden: 'expectedValue',
		// 			...init.headers,
		// 			someOtherHeaderSetAtConfig: 'expectedValue',
		// 		},
		// 	});
		// });

		// test('call isInstanceCreated', () => {
		// 	const createInstanceMock = spyOn(API.prototype, 'createInstance');
		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	api.createInstanceIfNotCreated();
		// 	expect(createInstanceMock).toHaveBeenCalled();
		// });

		// test('should not call createInstance when there is already an instance', () => {
		// 	// const api = new API(config);
		// 	const client = generateClient();
		// 	api.createInstance();
		// 	const createInstanceMock = spyOn(API.prototype, 'createInstance');
		// 	api.createInstanceIfNotCreated();
		// 	expect(createInstanceMock).not.toHaveBeenCalled();
		// });

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

	// describe.skip('configure test', () => {
	// 	test('without aws_project_region', () => {
	// 		const api = new API({});

	// 		const options = {
	// 			myoption: 'myoption',
	// 		};

	// 		expect(api.configure(options)).toEqual({
	// 			myoption: 'myoption',
	// 		});
	// 	});

	// 	test('with aws_project_region', () => {
	// 		const api = new API({});

	// 		const options = {
	// 			aws_project_region: 'region',
	// 		};

	// 		expect(api.configure(options)).toEqual({
	// 			aws_project_region: 'region',
	// 			header: {},
	// 			region: 'region',
	// 		});
	// 	});

	// 	test('with API options', () => {
	// 		const api = new API({});

	// 		const options = {
	// 			API: {
	// 				aws_project_region: 'api-region',
	// 			},
	// 			aws_project_region: 'region',
	// 			aws_appsync_region: 'appsync-region',
	// 		};

	// 		expect(api.configure(options)).toEqual({
	// 			aws_project_region: 'api-region',
	// 			aws_appsync_region: 'appsync-region',
	// 			header: {},
	// 			region: 'api-region',
	// 		});
	// 	});
	// });
});

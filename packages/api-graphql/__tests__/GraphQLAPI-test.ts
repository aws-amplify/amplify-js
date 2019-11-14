import Auth from '@aws-amplify/auth';
import { GraphQLAPIClass as API } from '../src';
import { graphqlOperation } from '../src/GraphQLAPI';
import { GRAPHQL_AUTH_MODE } from '../src/types';
import { RestClient } from '@aws-amplify/api-rest';
import { print } from 'graphql/language/printer';
import { parse } from 'graphql/language/parser';
import {
	Credentials,
	Constants,
	INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER,
} from '@aws-amplify/core';
import PubSub from '@aws-amplify/pubsub';
import Cache from '@aws-amplify/cache';
import * as Observable from 'zen-observable';

jest.mock('axios');

const config = {
	API: {
		region: 'region',
		header: {},
	},
};

afterEach(() => {
	jest.restoreAllMocks();
});

describe('API test', () => {
	describe('graphql test', () => {
		test('happy-case-query', async () => {
			const spyonAuth = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});

			const spyon = jest
				.spyOn(RestClient.prototype, 'post')
				.mockImplementationOnce((url, init) => {
					return new Promise((res, rej) => {
						res({});
					});
				});

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				apiKey = 'secret_api_key',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: apiKey,
			});
			const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
				getEvent(id: $id) {
					id
					name
					where
					when
					description
					comments(nextToken: $nextToken) {
						items {
						commentId
						content
						createdAt
						}
					}
				}
			}`;

			const doc = parse(GetEvent);
			const query = print(doc);

			const headers = {
				Authorization: null,
				'X-Api-Key': apiKey,
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
			};

			await api.graphql(graphqlOperation(GetEvent, variables));

			expect(spyon).toBeCalledWith(url, init);
		});

		test('happy-case-query-ast', async () => {
			const spyonAuth = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});

			const spyon = jest
				.spyOn(RestClient.prototype, 'post')
				.mockImplementationOnce((url, init) => {
					return new Promise((res, rej) => {
						res({});
					});
				});

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				apiKey = 'secret_api_key',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: apiKey,
			});
			const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
				getEvent(id: $id) {
					id
					name
					where
					when
					description
					comments(nextToken: $nextToken) {
						items {
							commentId
							content
							createdAt
						}
					}
				}
			}`;

			const doc = parse(GetEvent);
			const query = print(doc);

			const headers = {
				Authorization: null,
				'X-Api-Key': apiKey,
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
			};

			await api.graphql(graphqlOperation(doc, variables));

			expect(spyon).toBeCalledWith(url, init);
		});

		test('happy-case-query-oidc', async () => {
			const spyonAuth = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});

			const cache_config = {
				capacityInBytes: 3000,
				itemMaxSize: 800,
				defaultTTL: 3000000,
				defaultPriority: 5,
				warningThreshold: 0.8,
				storage: window.localStorage,
			};

			Cache.configure(cache_config);

			const spyonCache = jest
				.spyOn(Cache, 'getItem')
				.mockImplementationOnce(() => {
					return {
						token: 'id_token',
					};
				});

			const spyon = jest
				.spyOn(RestClient.prototype, 'post')
				.mockImplementationOnce((url, init) => {
					return new Promise((res, rej) => {
						res({});
					});
				});

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'OPENID_CONNECT',
			});
			const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
				getEvent(id: $id) {
					id
					name
					where
					when
					description
					comments(nextToken: $nextToken) {
						items {
						commentId
						content
						createdAt
						}
					}
				}
			}`;

			const doc = parse(GetEvent);
			const query = print(doc);

			const headers = {
				Authorization: 'id_token',
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
			};

			await api.graphql(graphqlOperation(GetEvent, variables));

			expect(spyon).toBeCalledWith(url, init);

			spyonCache.mockClear();
		});

		test('multi-auth default case AWS_IAM, using API_KEY as auth mode', async () => {
			expect.assertions(1);

			const cache_config = {
				capacityInBytes: 3000,
				itemMaxSize: 800,
				defaultTTL: 3000000,
				defaultPriority: 5,
				warningThreshold: 0.8,
				storage: window.localStorage,
			};

			Cache.configure(cache_config);

			const spyon = jest
				.spyOn(RestClient.prototype, 'post')
				.mockReturnValue(Promise.resolve({}));

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
				apiKey = 'secret-api-key';
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'AWS_IAM',
				aws_appsync_apiKey: apiKey,
			});
			const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
				getEvent(id: $id) {
					id
					name
					where
					when
					description
					comments(nextToken: $nextToken) {
						items {
						commentId
						content
						createdAt
						}
					}
				}
			}`;

			const doc = parse(GetEvent);
			const query = print(doc);

			const headers = {
				Authorization: null,
				'X-Api-Key': 'secret-api-key',
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
			};

			await api.graphql({
				query: GetEvent,
				variables,
				authMode: GRAPHQL_AUTH_MODE.API_KEY,
			});

			expect(spyon).toBeCalledWith(url, init);
		});
		test('multi-auth default case api-key, using AWS_IAM as auth mode', async () => {
			expect.assertions(1);
			jest.spyOn(Credentials, 'get').mockReturnValue(Promise.resolve('cred'));

			const spyon = jest
				.spyOn(RestClient.prototype, 'post')
				.mockReturnValue(Promise.resolve({}));

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
				apiKey = 'secret-api-key';
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: apiKey,
			});
			const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
				getEvent(id: $id) {
					id
					name
					where
					when
					description
					comments(nextToken: $nextToken) {
						items {
						commentId
						content
						createdAt
						}
					}
				}
			}`;

			const doc = parse(GetEvent);
			const query = print(doc);

			const headers = { 'x-amz-user-agent': Constants.userAgent };

			const body = {
				query,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
			};

			await api.graphql({
				query: GetEvent,
				variables,
				authMode: GRAPHQL_AUTH_MODE.AWS_IAM,
			});

			expect(spyon).toBeCalledWith(url, init);
		});
		test('multi-auth default case api-key, using OIDC as auth mode', async () => {
			expect.assertions(1);
			const cache_config = {
				capacityInBytes: 3000,
				itemMaxSize: 800,
				defaultTTL: 3000000,
				defaultPriority: 5,
				warningThreshold: 0.8,
				storage: window.localStorage,
			};

			Cache.configure(cache_config);

			jest.spyOn(Cache, 'getItem').mockReturnValue({ token: 'oidc_token' });

			const spyon = jest
				.spyOn(RestClient.prototype, 'post')
				.mockReturnValue(Promise.resolve({}));

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
				apiKey = 'secret-api-key';
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: apiKey,
			});
			const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
				getEvent(id: $id) {
					id
					name
					where
					when
					description
					comments(nextToken: $nextToken) {
						items {
						commentId
						content
						createdAt
						}
					}
				}
			}`;

			const doc = parse(GetEvent);
			const query = print(doc);

			const headers = {
				Authorization: 'oidc_token',
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
			};

			await api.graphql({
				query: GetEvent,
				variables,
				authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT,
			});

			expect(spyon).toBeCalledWith(url, init);
		});
		test('multi-auth using OIDC as auth mode, but no federatedSign', async () => {
			expect.assertions(1);

			const cache_config = {
				capacityInBytes: 3000,
				itemMaxSize: 800,
				defaultTTL: 3000000,
				defaultPriority: 5,
				warningThreshold: 0.8,
				storage: window.localStorage,
			};

			Cache.configure(cache_config);

			jest.spyOn(Cache, 'getItem').mockReturnValue(null);

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
				apiKey = 'secret-api-key';
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: apiKey,
			});
			const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
				getEvent(id: $id) {
					id
					name
					where
					when
					description
					comments(nextToken: $nextToken) {
							items {
							commentId
							content
							createdAt
						}
					}
				}
			}`;

			expect(
				api.graphql({
					query: GetEvent,
					variables,
					authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT,
				})
			).rejects.toThrowError('No federated jwt');
		});
		test('multi-auth using CUP as auth mode, but no userpool', async () => {
			expect.assertions(1);

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
				apiKey = 'secret-api-key';
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: apiKey,
			});
			const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
				getEvent(id: $id) {
					id
					name
					where
					when
					description
					comments(nextToken: $nextToken) {
						items {
						commentId
						content
						createdAt
					}
					}
				}
			}`;

			expect(
				api.graphql({
					query: GetEvent,
					variables,
					authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				})
			).rejects.toThrowError('No userPool');
		});

		test('multi-auth using API_KEY as auth mode, but no api-key configured', async () => {
			expect.assertions(1);

			const cache_config = {
				capacityInBytes: 3000,
				itemMaxSize: 800,
				defaultTTL: 3000000,
				defaultPriority: 5,
				warningThreshold: 0.8,
				storage: window.localStorage,
			};

			Cache.configure(cache_config);

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'AWS_IAM',
			});
			const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
				getEvent(id: $id) {
					id
					name
					where
					when
					description
					comments(nextToken: $nextToken) {
						items {
						commentId
						content
						createdAt
						}
					}
				}
			}`;

			expect(
				api.graphql({
					query: GetEvent,
					variables,
					authMode: GRAPHQL_AUTH_MODE.API_KEY,
				})
			).rejects.toThrowError('No api-key configured');
		});
		test('multi-auth using AWS_IAM as auth mode, but no credentials', async () => {
			expect.assertions(1);

			jest.spyOn(Credentials, 'get').mockReturnValue(Promise.reject());

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
				apiKey = 'secret-api-key';
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: apiKey,
			});
			const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
				getEvent(id: $id) {
					id
					name
					where
					when
					description
					comments(nextToken: $nextToken) {
						items {
						commentId
						content
						createdAt
						}
					}
				}
			}`;

			expect(
				api.graphql({
					query: GetEvent,
					variables,
					authMode: GRAPHQL_AUTH_MODE.AWS_IAM,
				})
			).rejects.toThrowError('No credentials');
		});

		test('multi-auth default case api-key, using CUP as auth mode', async () => {
			expect.assertions(1);
			const spyon = jest
				.spyOn(RestClient.prototype, 'post')
				.mockReturnValue(Promise.resolve({}));

			jest.spyOn(Auth, 'currentSession').mockReturnValue({
				getAccessToken: () => ({
					getJwtToken: () => 'Secret-Token',
				}),
			} as any);

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
				apiKey = 'secret-api-key';
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: apiKey,
			});
			const GetEvent = `query GetEvent($id: ID! $nextToken: String) {
				getEvent(id: $id) {
					id
					name
					where
					when
					description
					comments(nextToken: $nextToken) {
						items {
						commentId
						content
						createdAt
						}
					}
				}
			}`;

			const doc = parse(GetEvent);
			const query = print(doc);

			const headers = {
				Authorization: 'Secret-Token',
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
			};

			await api.graphql({
				query: GetEvent,
				variables,
				authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
			});

			expect(spyon).toBeCalledWith(url, init);
		});

		test('authMode on subscription', async () => {
			expect.assertions(1);

			jest
				.spyOn(RestClient.prototype, 'post')
				.mockImplementation(async (url, init) => ({
					extensions: {
						subscription: {
							newSubscriptions: {},
						},
					},
				}));

			const cache_config = {
				capacityInBytes: 3000,
				itemMaxSize: 800,
				defaultTTL: 3000000,
				defaultPriority: 5,
				warningThreshold: 0.8,
				storage: window.localStorage,
			};

			Cache.configure(cache_config);

			jest.spyOn(Cache, 'getItem').mockReturnValue({ token: 'id_token' });

			const spyon_Graphql = jest.spyOn(API.prototype as any, '_graphql');

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				apiKey = 'secret_api_key',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: apiKey,
			});

			PubSub.subscribe = jest.fn(() => Observable.of({}));

			const SubscribeToEventComments = `subscription SubscribeToEventComments($eventId: String!) {
				subscribeToEventComments(eventId: $eventId) {
					eventId
					commentId
					content
				}
			}`;

			const doc = parse(SubscribeToEventComments);
			const query = print(doc);

			(api.graphql({
				query,
				variables,
				authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT,
			}) as any).subscribe();

			expect(spyon_Graphql).toBeCalledWith(
				expect.objectContaining({
					authMode: 'OPENID_CONNECT',
				}),
				{}
			);
		});

		test('happy-case-subscription', async done => {
			jest
				.spyOn(RestClient.prototype, 'post')
				.mockImplementation(async (url, init) => ({
					extensions: {
						subscription: {
							newSubscriptions: {},
						},
					},
				}));

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				apiKey = 'secret_api_key',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: apiKey,
			});

			PubSub.subscribe = jest.fn(() => Observable.of({}));

			const SubscribeToEventComments = `subscription SubscribeToEventComments($eventId: String!) {
				subscribeToEventComments(eventId: $eventId) {
					eventId
					commentId
					content
				}
			}`;

			const doc = parse(SubscribeToEventComments);
			const query = print(doc);

			const observable = (api.graphql(
				graphqlOperation(query, variables)
			) as Observable<object>).subscribe({
				next: () => {
					expect(PubSub.subscribe).toHaveBeenCalledTimes(1);
					const subscribeOptions = (PubSub.subscribe as any).mock.calls[0][1];
					expect(subscribeOptions.provider).toBe(
						INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER
					);
					done();
				},
			});

			expect(observable).not.toBe(undefined);
		});

		test('happy case mutation', async () => {
			const spyonAuth = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res('cred');
					});
				});

			const spyon = jest
				.spyOn(RestClient.prototype, 'post')
				.mockImplementationOnce((url, init) => {
					return new Promise((res, rej) => {
						res({});
					});
				});
			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				apiKey = 'secret_api_key',
				variables = {
					id: '809392da-ec91-4ef0-b219-5238a8f942b2',
					content: 'lalala',
					createdAt: new Date().toISOString(),
				};
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: apiKey,
			});
			const AddComment = `mutation AddComment($eventId: ID!, $content: String!, $createdAt: String!) {
				commentOnEvent(eventId: $eventId, content: $content, createdAt: $createdAt) {
					eventId
					content
					createdAt
				}
			}`;

			const doc = parse(AddComment);
			const query = print(doc);

			const headers = {
				Authorization: null,
				'X-Api-Key': apiKey,
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
			};

			await api.graphql(graphqlOperation(AddComment, variables));

			expect(spyon).toBeCalledWith(url, init);
		});
	});

	describe('configure test', () => {
		test('without aws_project_region', () => {
			const api = new API({});

			const options = {
				myoption: 'myoption',
			};

			expect(api.configure(options)).toEqual({
				myoption: 'myoption',
			});
		});

		test('with aws_project_region', () => {
			const api = new API({});

			const options = {
				aws_project_region: 'region',
			};

			expect(api.configure(options)).toEqual({
				aws_project_region: 'region',
				header: {},
				region: 'region',
			});
		});

		test('with API options', () => {
			const api = new API({});

			const options = {
				API: {
					aws_project_region: 'api-region',
				},
				aws_project_region: 'region',
				aws_appsync_region: 'appsync-region',
			};

			expect(api.configure(options)).toEqual({
				aws_project_region: 'api-region',
				aws_appsync_region: 'appsync-region',
				header: {},
				region: 'api-region',
			});
		});
	});
});

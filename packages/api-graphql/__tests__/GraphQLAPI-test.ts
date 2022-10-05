import Auth from '@aws-amplify/auth';
import { GraphQLAPIClass as API } from '../src';
import { graphqlOperation } from '../src/GraphQLAPI';
import { GRAPHQL_AUTH_MODE, GraphQLAuthError } from '../src/types';
import { RestClient } from '@aws-amplify/api-rest';
import { print } from 'graphql/language/printer';
import { parse } from 'graphql/language/parser';
import {
	Signer,
	Credentials,
	Constants,
	INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER,
} from '@aws-amplify/core';
import PubSub from '@aws-amplify/pubsub';
import Cache from '@aws-amplify/cache';
import * as Observable from 'zen-observable';
import axios, { CancelTokenStatic } from 'axios';

axios.CancelToken = <CancelTokenStatic>{
	source: () => ({ token: null, cancel: null }),
};
axios.isCancel = (value: any): boolean => {
	return false;
};

let isCancelSpy = null;
let cancelTokenSpy = null;
let cancelMock = null;
let tokenMock = null;
let mockCancellableToken = null;
jest.mock('axios');

const config = {
	API: {
		region: 'region',
		header: {},
	},
};

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
const getEventDoc = parse(GetEvent);
const getEventQuery = print(getEventDoc);

afterEach(() => {
	jest.restoreAllMocks();
});

describe('API test', () => {
	beforeEach(() => {
		cancelMock = jest.fn();
		tokenMock = jest.fn();
		mockCancellableToken = { token: tokenMock, cancel: cancelMock };
		isCancelSpy = jest.spyOn(axios, 'isCancel').mockReturnValue(true);
		cancelTokenSpy = jest
			.spyOn(axios.CancelToken, 'source')
			.mockImplementation(() => {
				return mockCancellableToken;
			});
	});
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

			const headers = {
				Authorization: null,
				'X-Api-Key': apiKey,
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
			};

			await api.graphql(graphqlOperation(GetEvent, variables));

			expect(spyon).toBeCalledWith(url, init);
		});

		test('cancel-graphql-query', async () => {
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
						rej('error cancelled');
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

			const headers = {
				Authorization: null,
				'X-Api-Key': apiKey,
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
			};

			const promiseResponse = api.graphql(
				graphqlOperation(GetEvent, variables)
			);
			api.cancel(promiseResponse as Promise<any>, 'testmessage');

			expect.assertions(5);

			expect(cancelTokenSpy).toBeCalledTimes(1);
			expect(cancelMock).toBeCalledWith('testmessage');
			try {
				await promiseResponse;
			} catch (err) {
				expect(err).toEqual('error cancelled');
				expect(api.isCancel(err)).toBeTruthy();
			}
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

			const headers = {
				Authorization: null,
				'X-Api-Key': apiKey,
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
			};

			await api.graphql(graphqlOperation(getEventDoc, variables));

			expect(spyon).toBeCalledWith(url, init);
		});

		test('happy-case-query-oidc with Cache token', async () => {
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

			const headers = {
				Authorization: 'id_token',
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
			};

			await api.graphql(graphqlOperation(GetEvent, variables));

			expect(spyon).toBeCalledWith(url, init);

			spyonCache.mockClear();
		});

		test('happy-case-query-oidc with auth storage federated token', async () => {
			const spyonCredentials = jest
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
					return null;
				});

			const spyonAuth = jest
				.spyOn(Auth, 'currentAuthenticatedUser')
				.mockImplementationOnce(() => {
					return new Promise((res, rej) => {
						res({
							name: 'federated user',
							token: 'federated_token_from_storage',
						});
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
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'OPENID_CONNECT',
			});

			const headers = {
				Authorization: 'federated_token_from_storage',
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
			};

			await api.graphql(graphqlOperation(GetEvent, variables));

			expect(spyon).toBeCalledWith(url, init);

			spyonCredentials.mockClear();
			spyonCache.mockClear();
			spyonAuth.mockClear();
		});

		test('happy case query with AWS_LAMBDA', async () => {
			expect.assertions(1);

			const spyon = jest
				.spyOn(RestClient.prototype, 'post')
				.mockReturnValue(Promise.resolve({}));

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com';
			const region = 'us-east-2';
			const variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'AWS_LAMBDA',
			});

			const headers = {
				'x-amz-user-agent': Constants.userAgent,
				Authorization: 'myAuthToken',
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
			};

			await api.graphql({
				query: GetEvent,
				variables,
				authToken: 'myAuthToken',
			});

			expect(spyon).toBeCalledWith(url, init);
		});

		test('additional headers with AWS_LAMBDA', async () => {
			expect.assertions(1);

			const spyon = jest
				.spyOn(RestClient.prototype, 'post')
				.mockReturnValue(Promise.resolve({}));

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com';
			const region = 'us-east-2';
			const variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'AWS_LAMBDA',
			});

			const headers = {
				'x-amz-user-agent': Constants.userAgent,
				Authorization: 'myAuthToken',
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
			};

			await api.graphql(
				{
					query: GetEvent,
					variables,
					authToken: 'myAuthToken',
				},
				{ Authorization: 'anotherAuthToken' }
			);

			expect(spyon).toBeCalledWith(url, init);
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

			const headers = {
				Authorization: null,
				'X-Api-Key': 'secret-api-key',
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
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

			const headers = { 'x-amz-user-agent': Constants.userAgent };

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
			};

			await api.graphql({
				query: GetEvent,
				variables,
				authMode: GRAPHQL_AUTH_MODE.AWS_IAM,
			});

			expect(spyon).toBeCalledWith(url, init);
		});

		test('multi-auth default case api-key, using AWS_LAMBDA as auth mode', async () => {
			expect.assertions(1);

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

			const headers = {
				'x-amz-user-agent': Constants.userAgent,
				Authorization: 'myAuthToken',
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
			};

			await api.graphql({
				query: GetEvent,
				variables,
				authMode: GRAPHQL_AUTH_MODE.AWS_LAMBDA,
				authToken: 'myAuthToken',
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

			const headers = {
				Authorization: 'oidc_token',
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
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

			expect(
				api.graphql({
					query: GetEvent,
					variables,
					authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
				})
			).rejects.toThrow();
		});

		test('multi-auth using AWS_LAMBDA as auth mode, but no auth token specified', async () => {
			expect.assertions(1);

			const api = new API(config);
			const url = 'https://appsync.amazonaws.com',
				region = 'us-east-2',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'AWS_IAM',
			});

			expect(
				api.graphql({
					query: GetEvent,
					variables,
					authMode: GRAPHQL_AUTH_MODE.AWS_LAMBDA,
				})
			).rejects.toThrowError(GraphQLAuthError.NO_AUTH_TOKEN);
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

			const headers = {
				Authorization: 'Secret-Token',
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
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

			const spyon_pubsub = jest
				.spyOn(PubSub, 'subscribe')
				.mockImplementation(jest.fn(() => Observable.of({})));

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

			const SubscribeToEventComments = `subscription SubscribeToEventComments($eventId: String!) {
				subscribeToEventComments(eventId: $eventId) {
					eventId
					commentId
					content
				}
			}`;

			const doc = parse(SubscribeToEventComments);
			const query = print(doc);

			(
				api.graphql({
					query,
					variables,
					authMode: GRAPHQL_AUTH_MODE.OPENID_CONNECT,
				}) as any
			).subscribe();

			expect(spyon_pubsub).toBeCalledWith(
				'',
				expect.objectContaining({
					authenticationType: 'OPENID_CONNECT',
				})
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

			const observable = (
				api.graphql(graphqlOperation(query, variables)) as Observable<object>
			).subscribe({
				next: () => {
					expect(PubSub.subscribe).toHaveBeenCalledTimes(1);
					const subscribeOptions = (PubSub.subscribe as any).mock.calls[0][1];
					expect(subscribeOptions.provider).toBe(
						INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER
					);
					done();
				},
			});

			expect(observable).not.toBe(undefined);
		});

		test('happy case subscription with additionalHeaders', async done => {
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

			const additionalHeaders = {
				'x-custom-header': 'value',
			};

			const observable = (
				api.graphql(
					graphqlOperation(query, variables),
					additionalHeaders
				) as Observable<object>
			).subscribe({
				next: () => {
					expect(PubSub.subscribe).toHaveBeenCalledTimes(1);
					const subscribeOptions = (PubSub.subscribe as any).mock.calls[0][1];
					expect(subscribeOptions.additionalHeaders).toBe(additionalHeaders);
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
				cancellableToken: mockCancellableToken,
			};

			await api.graphql(graphqlOperation(AddComment, variables));

			expect(spyon).toBeCalledWith(url, init);
		});

		test('happy case query with additionalHeaders', async () => {
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
				graphql_headers: async () =>
					Promise.resolve({
						someHeaderSetAtConfigThatWillBeOverridden: 'initialValue',
						someOtherHeaderSetAtConfig: 'expectedValue',
					}),
			});

			const headers = {
				Authorization: null,
				'X-Api-Key': apiKey,
				'x-amz-user-agent': Constants.userAgent,
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
			};

			const additionalHeaders = {
				someAddtionalHeader: 'foo',
				someHeaderSetAtConfigThatWillBeOverridden: 'expectedValue',
			};

			await api.graphql(
				graphqlOperation(GetEvent, variables),
				additionalHeaders
			);

			expect(spyon).toBeCalledWith(url, {
				...init,
				headers: {
					someAddtionalHeader: 'foo',
					someHeaderSetAtConfigThatWillBeOverridden: 'expectedValue',
					...init.headers,
					someOtherHeaderSetAtConfig: 'expectedValue',
				},
			});
		});

		test('sends userAgent with suffix in request', async () => {
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
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' },
				userAgentSuffix = '/DataStore';
			api.configure({
				aws_appsync_graphqlEndpoint: url,
				aws_appsync_region: region,
				aws_appsync_authenticationType: 'API_KEY',
				aws_appsync_apiKey: apiKey,
			});

			const headers = {
				Authorization: null,
				'X-Api-Key': apiKey,
				'x-amz-user-agent': `${Constants.userAgent}${userAgentSuffix}`,
			};

			const body = {
				query: getEventQuery,
				variables,
			};

			const init = {
				headers,
				body,
				signerServiceInfo: {
					service: 'appsync',
					region,
				},
				cancellableToken: mockCancellableToken,
			};
			let authToken: undefined;

			await api.graphql(
				graphqlOperation(GetEvent, variables, authToken, userAgentSuffix)
			);

			expect(spyon).toBeCalledWith(url, init);
		});

		test('call isInstanceCreated', () => {
			const createInstanceMock = spyOn(API.prototype, 'createInstance');
			const api = new API(config);
			api.createInstanceIfNotCreated();
			expect(createInstanceMock).toHaveBeenCalled();
		});

		test('should not call createInstance when there is already an instance', () => {
			const api = new API(config);
			api.createInstance();
			const createInstanceMock = spyOn(API.prototype, 'createInstance');
			api.createInstanceIfNotCreated();
			expect(createInstanceMock).not.toHaveBeenCalled();
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

import * as raw from '../src';
import { graphql, cancel, isCancelError } from '../src/internals/v6';
import { Amplify } from 'aws-amplify';
import { Amplify as AmplifyCore } from '@aws-amplify/core';
import * as typedQueries from './fixtures/with-types/queries';
import { expectGet } from './utils/expects';

import {
	__amplify,
	GraphQLResult,
	GraphQLAuthError,
	V6Client,
} from '../src/types';
import { GetThreadQuery } from './fixtures/with-types/API';
import { AWSAppSyncRealTimeProvider } from '../src/Providers/AWSAppSyncRealTimeProvider';
import { Observable, of } from 'rxjs';
import { GraphQLApiError } from '../src/utils/errors';
import { NO_ENDPOINT } from '../src/utils/errors/constants';
import { GraphQLError } from 'graphql';

const serverManagedFields = {
	id: 'some-id',
	owner: 'wirejobviously',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

let mockAccessToken: string | null = 'mock-access-token';

let mockCredentials: any = {
	accessKeyId: 'mock-access-key-id',
	secretAccessKey: 'mock-secret-access-key',
};

jest.mock('aws-amplify', () => {
	const originalModule = jest.requireActual('aws-amplify');

	const mockedModule = {
		...originalModule,
		Amplify: {
			...originalModule.Amplify,
			Auth: {
				...originalModule.Amplify.Auth,
				fetchAuthSession: jest.fn(() => {
					return {
						tokens: {
							accessToken: {
								toString: () => mockAccessToken,
							},
						},
						credentials: mockCredentials,
					};
				}),
			},
		},
	};
	return mockedModule;
});

const client = {
	[__amplify]: Amplify,
	graphql,
	cancel,
	isCancelError,
} as unknown as V6Client;

const mockFetchAuthSession = (Amplify as any).Auth
	.fetchAuthSession as jest.Mock;

describe('API test', () => {
	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
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

		test('auth-error-case', async () => {
			expect.assertions(1);
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

			const err = {
				name: 'GraphQLError',
				message: 'Unknown error',
				originalError: {
					name: 'UnauthorizedException',
					underlyingError: {
						name: 'UnauthorizedException',
						$metadata: {
							httpStatusCode: 401,
							requestId: '12345abcde-test-error-id',
						},
					},
					$metadata: {
						httpStatusCode: 401,
						requestId: '12345abcde-test-error-id',
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockImplementation(() => {
					return {
						body: {
							json: () => ({
								errors: [err],
							}),
						},
					};
				});

			try {
				const result: GraphQLResult<GetThreadQuery> = await client.graphql({
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'apiKey',
				});
			} catch (e: any) {
				const errors = e.errors;
				expect(errors).toEqual([
					expect.objectContaining({
						message: 'Unauthorized',
						recoverySuggestion: expect.stringContaining(
							`If you're calling an Amplify-generated API, make sure to set the "authMode" in generateClient`,
						),
					}),
				]);
			}
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

			jest
				.spyOn((raw.GraphQLAPI as any)._api, 'isCancelErrorREST')
				.mockReturnValue(true);

			let promiseToCancel;
			let isCancelErrorResult;

			try {
				promiseToCancel = client.graphql({ query: 'query' });
				await promiseToCancel;
			} catch (e) {
				isCancelErrorResult = client.isCancelError(e);
			}

			const cancellationResult = client.cancel(promiseToCancel);

			expect(cancellationResult).toBe(true);
			expect(isCancelErrorResult).toBe(true);
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

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					Auth: expect.any(Object),
					configure: expect.any(Function),
					getConfig: expect.any(Function),
				}),
				{
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
				},
			);
		});

		test('happy-case-query-oidc with auth storage federated token', async () => {
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
			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					Auth: expect.any(Object),
					configure: expect.any(Function),
					getConfig: expect.any(Function),
				}),
				{
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
				},
			);
		});

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
			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					Auth: expect.any(Object),
					configure: expect.any(Function),
					getConfig: expect.any(Function),
				}),
				{
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
				},
			);
		});

		test('additional headers with AWS_LAMBDA', async () => {
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

			const result: GraphQLResult<GetThreadQuery> = await client.graphql(
				{
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'oidc',
				},
				{
					Authorization: 'additional-header-auth-token',
				},
			);

			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					Auth: expect.any(Object),
					configure: expect.any(Function),
					getConfig: expect.any(Function),
				}),
				{
					abortController: expect.any(AbortController),
					url: new URL('https://localhost/graphql'),
					options: expect.objectContaining({
						headers: expect.objectContaining({
							Authorization: 'additional-header-auth-token',
						}),
						signingServiceInfo: expect.objectContaining({
							region: 'local-host-h4x',
							service: 'appsync',
						}),
					}),
				},
			);
		});

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
			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					Auth: expect.any(Object),
					configure: expect.any(Function),
					getConfig: expect.any(Function),
				}),
				{
					abortController: expect.any(AbortController),
					url: new URL('https://localhost/graphql'),
					options: expect.objectContaining({
						headers: expect.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
						signingServiceInfo: undefined,
					}),
				},
			);
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

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					Auth: expect.any(Object),
					configure: expect.any(Function),
					getConfig: expect.any(Function),
				}),
				{
					abortController: expect.any(AbortController),
					url: new URL('https://localhost/graphql'),
					options: expect.objectContaining({
						headers: expect.not.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
						signingServiceInfo: expect.objectContaining({
							region: 'local-host-h4x',
							service: 'appsync',
						}),
					}),
				},
			);
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

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					Auth: expect.any(Object),
					configure: expect.any(Function),
					getConfig: expect.any(Function),
				}),
				{
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
				},
			);
		});

		test('multi-auth default case api-key, OIDC as auth mode, but no federatedSign', async () => {
			mockFetchAuthSession.mockRejectedValueOnce(
				new Error('mock failing fetchAuthSession() call here.'),
			);

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

			jest.spyOn((raw.GraphQLAPI as any)._api, 'post').mockReturnValue({
				body: {
					json: () => graphqlResponse,
				},
			});

			await expect(
				client.graphql({
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'oidc',
				}),
			).rejects.toThrow('No current user');
		});

		test('multi-auth using CUP as auth mode, but no userpool', async () => {
			const prevMockAccessToken = mockAccessToken;
			mockAccessToken = null;

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

			const graphqlVariables = { id: 'some-id' };

			await expect(
				client.graphql({
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'userPool',
				}),
			).rejects.toThrow();

			// Cleanup:
			mockAccessToken = prevMockAccessToken;
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
				}),
			).rejects.toThrow(GraphQLAuthError.NO_AUTH_TOKEN);
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
				}),
			).rejects.toThrow(GraphQLAuthError.NO_API_KEY);
		});

		test('multi-auth using AWS_IAM as auth mode, but no credentials', async () => {
			const prevMockCredentials = mockCredentials;
			mockCredentials = undefined;

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
				}),
			).rejects.toThrow(GraphQLAuthError.NO_CREDENTIALS);

			// Cleanup:
			mockCredentials = prevMockCredentials;
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
			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					Auth: expect.any(Object),
					configure: expect.any(Function),
					getConfig: expect.any(Function),
				}),
				{
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
				},
			);
		});

		test('authMode on subscription', async () => {
			expect.assertions(1);

			const spyon_appsync_realtime = jest
				.spyOn(AWSAppSyncRealTimeProvider.prototype, 'subscribe')
				.mockImplementation(jest.fn(() => of({}) as any));

			const url = 'https://appsync.amazonaws.com',
				variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

			const query = `subscription SubscribeToEventComments($eventId: String!) {
				subscribeToEventComments(eventId: $eventId) {
					eventId
					commentId
					content
				}
			}`;

			(
				client.graphql({
					query,
					variables,
					authMode: 'oidc',
				}) as any
			).subscribe();

			expect(spyon_appsync_realtime).toHaveBeenCalledWith(
				expect.objectContaining({
					authenticationType: 'oidc',
				}),
				expect.anything(),
			);
		});

		test('happy-case-subscription', done => {
			const spyon_appsync_realtime = jest
				.spyOn(AWSAppSyncRealTimeProvider.prototype, 'subscribe')
				.mockImplementation(jest.fn(() => of({}) as any));

			const query = `subscription SubscribeToEventComments($eventId: String!) {
				subscribeToEventComments(eventId: $eventId) {
					eventId
					commentId
					content
				}
			}`;

			const variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

			const observable = (
				client.graphql({ query, variables }) as unknown as Observable<object>
			).subscribe({
				next: () => {
					expect(spyon_appsync_realtime).toHaveBeenCalledTimes(1);
					const subscribeOptions = spyon_appsync_realtime.mock.calls[0][0];
					expect(subscribeOptions?.variables).toBe(variables);
					done();
				},
			});

			expect(observable).not.toBe(undefined);
		});

		test('subscription auth permissions error', done => {
			expect.assertions(3);

			const spyon_appsync_realtime = jest
				.spyOn(AWSAppSyncRealTimeProvider.prototype, 'subscribe')
				.mockImplementation(
					jest.fn(() => {
						return new Observable(observer => {
							observer.error({
								errors: [
									{
										message:
											'Connection failed: {"errors":[{"errorType":"UnauthorizedException","message":"Permission denied"}]}',
									},
								],
							});
						});
					}),
				);

			const query = `subscription SubscribeToEventComments($eventId: String!) {
				subscribeToEventComments(eventId: $eventId) {
					eventId
					commentId
					content
				}
			}`;

			const variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

			const observable = (
				client.graphql({ query, variables }) as unknown as Observable<object>
			).subscribe({
				error: e => {
					expect(spyon_appsync_realtime).toHaveBeenCalledTimes(1);
					expect(e.errors).toEqual([
						expect.objectContaining({
							message: 'Unauthorized',
							recoverySuggestion: expect.stringContaining(
								`If you're calling an Amplify-generated API, make sure to set the "authMode" in generateClient`,
							),
						}),
					]);
					done();
				},
			});

			expect(observable).not.toBe(undefined);
		});

		test('happy case subscription with additionalHeaders', done => {
			const spyon_appsync_realtime = jest
				.spyOn(AWSAppSyncRealTimeProvider.prototype, 'subscribe')
				.mockImplementation(jest.fn(() => of({}) as any));

			const variables = { id: '809392da-ec91-4ef0-b219-5238a8f942b2' };

			const query = `subscription SubscribeToEventComments($eventId: String!) {
				subscribeToEventComments(eventId: $eventId) {
					eventId
					commentId
					content
				}
			}`;

			const additionalHeaders = {
				'x-custom-header': 'value',
			};

			const observable = (
				client.graphql(
					{ query, variables },
					additionalHeaders,
				) as unknown as Observable<object>
			).subscribe({
				next: () => {
					expect(spyon_appsync_realtime).toHaveBeenCalledTimes(1);
					const subscribeOptions = spyon_appsync_realtime.mock.calls[0][0];
					expect(subscribeOptions?.additionalHeaders).toBe(additionalHeaders);
					done();
				},
			});

			expect(observable).not.toBe(undefined);
		});

		test('happy case query with additionalHeaders', async () => {
			/**
			 * Create a new client with unmocked Amplify imported from `core`.
			 * This is necessary to preserve the `libraryOptions` on the singleton
			 * (in this test case, headers passed via configuration options).
			 */
			const optionsClient = {
				[__amplify]: AmplifyCore,
				graphql,
				cancel,
			} as unknown as V6Client;

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
				},
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

			const result: GraphQLResult<GetThreadQuery> = await optionsClient.graphql(
				{
					query: typedQueries.getThread,
					variables: graphqlVariables,
				},
				additionalHeaders,
			);

			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					Auth: expect.any(Object),
					configure: expect.any(Function),
					getConfig: expect.any(Function),
				}),
				{
					abortController: expect.any(AbortController),
					url: new URL('https://localhost/graphql'),
					options: expect.objectContaining({
						headers: expect.objectContaining({
							someAdditionalHeader: 'foo',
							someHeaderSetAtConfigThatWillBeOverridden: 'expectedValue',
							someOtherHeaderSetAtConfig: 'expectedValue',
						}),
						signingServiceInfo: undefined,
					}),
				},
			);
		});

		test('sends cookies with request', async () => {
			/**
			 * Create a new client with unmocked Amplify imported from `core`.
			 * This is necessary to preserve the `libraryOptions` on the singleton
			 * (in this test case, headers passed via configuration options).
			 */
			const optionsClient = {
				[__amplify]: AmplifyCore,
				graphql,
				cancel,
			} as unknown as V6Client;

			Amplify.configure(
				{
					API: {
						GraphQL: {
							defaultAuthMode: 'iam',
							apiKey: 'FAKE-KEY',
							endpoint: 'https://localhost/graphql',
							region: 'local-host-h4x',
						},
					},
				},
				{
					API: {
						GraphQL: {
							withCredentials: true,
						},
					},
				},
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

			const result: GraphQLResult<GetThreadQuery> = await optionsClient.graphql(
				{
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'apiKey',
				},
			);

			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					Auth: expect.any(Object),
					configure: expect.any(Function),
					getConfig: expect.any(Function),
				}),
				{
					abortController: expect.any(AbortController),
					url: new URL('https://localhost/graphql'),
					options: expect.objectContaining({
						headers: expect.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
						signingServiceInfo: undefined,
						withCredentials: true,
					}),
				},
			);
		});

		test('throws a GraphQLResult with NO_ENDPOINT error when endpoint is not configured', () => {
			const expectedGraphQLApiError = new GraphQLApiError(NO_ENDPOINT);

			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'apiKey',
						apiKey: 'FAKE-KEY',
						region: 'local-host-h4x',
					} as any,
				},
			});

			const graphqlVariables = { id: 'some-id' };

			expect(() =>
				client.graphql({
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'iam',
				}),
			).rejects.toEqual(
				expect.objectContaining({
					errors: expect.arrayContaining([
						new GraphQLError(
							expectedGraphQLApiError.message,
							null,
							null,
							null,
							null,
							expectedGraphQLApiError,
						),
					]),
				}),
			);
		});

		test('throws a GraphQLResult with NetworkError when the `post()` API throws for network error', () => {
			const postAPIThrownError = new Error('Network error');
			jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockRejectedValueOnce(postAPIThrownError);

			Amplify.configure({
				API: {
					GraphQL: {
						defaultAuthMode: 'userPool',
						endpoint: 'https://localhost/graphql',
						region: 'local-host-h4x',
					},
				},
			});

			const graphqlVariables = { id: 'some-id' };

			expect(
				client.graphql({
					query: typedQueries.getThread,
					variables: graphqlVariables,
				}),
			).rejects.toEqual(
				expect.objectContaining({
					errors: expect.arrayContaining([
						new GraphQLError(
							postAPIThrownError.message,
							null,
							null,
							null,
							null,
							postAPIThrownError,
						),
					]),
				}),
			);
		});
	});
});

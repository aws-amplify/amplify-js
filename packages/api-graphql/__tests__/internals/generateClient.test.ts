import * as raw from '../../src';
import { AmplifyContext } from '@aws-amplify/core';
import { configure } from 'aws-amplify';
import { generateClient } from '../../src/internals';
import configFixture from '../fixtures/modeled/amplifyconfiguration';
import { Schema } from '../fixtures/modeled/schema';
import { Observable, from } from 'rxjs';
import {
	normalizePostGraphqlCalls,
	expectSubWithHeaders,
	expectSubWithHeadersFn,
	expectSubWithlibraryConfigHeaders,
	mockApiResponse,
	setMockPost,
} from '../utils/index';
import { AWSAppSyncRealTimeProvider } from '../../src/Providers/AWSAppSyncRealTimeProvider';

// Mock post from api-rest internals
const mockPost = jest.fn();
jest.mock('@aws-amplify/api-rest/internals', () => ({
	...jest.requireActual('@aws-amplify/api-rest/internals'),
	post: (...args: any[]) => mockPost(...args),
}));

setMockPost(mockPost);

const serverManagedFields = {
	id: 'some-id',
	owner: 'wirejobviously',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

describe('generateClient', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('client `models` property', () => {
		const expectedModelsProperties = ['Todo', 'Note', 'TodoMetadata'];

		it('generates `models` property when config has valid GraphQL provider config', () => {
			const ctx = configure(configFixture);

			const client = generateClient<Schema>({ amplify: ctx });

			expect(Object.keys(client.models)).toEqual(expectedModelsProperties);
		});

		it('generates `models` property after reconfiguring with valid GraphQL provider config', () => {
			const emptyCtx = configure({});
			const client = generateClient<Schema>({ amplify: emptyCtx });

			expect(Object.keys(client.models)).toHaveLength(0);

			const ctx = configure(configFixture);
			const client2 = generateClient<Schema>({ amplify: ctx });

			expect(Object.keys(client2.models)).toEqual(expectedModelsProperties);
		});

		it('generates `models` property throwing error when there is no valid GraphQL provider config can be resolved', () => {
			const ctx = configure({});
			const client = generateClient<Schema>({ amplify: ctx });

			expect(() => {
				client.models.Todo.create({ name: 'todo' });
			}).toThrow(
				'Client could not be generated. This is likely due to `Amplify.configure()` not being called prior to `generateClient()` or because the configuration passed to `Amplify.configure()` is missing GraphQL provider configuration.',
			);
		});
	});

	test('can produce a client bound to an arbitrary amplify object for getConfig()', async () => {
		const fetchAuthSession = jest.fn().mockReturnValue({});
		const amplify = {
			fetchAuthSession,
			resourcesConfig: {
				API: {
					GraphQL: {
						apiKey: 'apikey',
						customEndpoint: undefined,
						customEndpointRegion: undefined,
						defaultAuthMode: 'apiKey',
						endpoint: 'https://0.0.0.0/graphql',
						region: 'us-east-1',
					},
				},
			},
			libraryOptions: {},
		} as unknown as AmplifyContext;

		const apiSpy = mockPost.mockReturnValue({
			body: {
				json: () => ({
					data: {
						getWidget: {
							__typename: 'Widget',
							...serverManagedFields,
							someField: 'some value',
						},
					},
				}),
			},
		});

		const client = generateClient({ amplify });
		await client.graphql({
			query: `query Q {
				getWidget {
					__typename id owner createdAt updatedAt someField
				}
			}`,
		});

		expect(fetchAuthSession).not.toHaveBeenCalled();
		expect(apiSpy).toHaveBeenCalled();
	});

	test('can produce a client bound to an arbitrary amplify object for fetchAuthSession()', async () => {
		const fetchAuthSession = jest.fn().mockReturnValue({ credentials: {} });
		const amplify = {
			fetchAuthSession,
			resourcesConfig: {
				API: {
					GraphQL: {
						apiKey: undefined,
						customEndpoint: undefined,
						customEndpointRegion: undefined,
						defaultAuthMode: 'iam',
						endpoint: 'https://0.0.0.0/graphql',
						region: 'us-east-1',
					},
				},
			},
			libraryOptions: {},
		} as unknown as AmplifyContext;

		const apiSpy = mockPost.mockReturnValue({
			body: {
				json: () => ({
					data: {
						getWidget: {
							__typename: 'Widget',
							...serverManagedFields,
							someField: 'some value',
						},
					},
				}),
			},
		});

		const client = generateClient({ amplify });
		await client.graphql({
			query: `query Q {
				getWidget {
					__typename id owner createdAt updatedAt someField
				}
			}`,
		});

		expect(fetchAuthSession).toHaveBeenCalled();
		expect(apiSpy).toHaveBeenCalled();
	});

	describe('graphql default auth', () => {
		test('default iam produces expected signingInfo', async () => {
			const ctx = {
				resourcesConfig: configure({
					...configFixture,
					aws_appsync_authenticationType: 'AWS_IAM',
				} as any).resourcesConfig,
				libraryOptions: {},
				fetchAuthSession: jest.fn().mockResolvedValue({
					credentials: {
						accessKeyId: 'test',
						secretAccessKey: 'test',
					},
				}),
				clearCredentials: jest.fn(),
				getTokens: jest.fn(),
			} as unknown as AmplifyContext;

			const spy = mockApiResponse({
				data: {
					listTodos: {
						items: [
							{
								name: 'some name',
								description: 'something something',
							},
						],
					},
				},
			});

			const client = generateClient({ amplify: ctx });
			await client.graphql({
				query: `query { listTodos { __typename id owner createdAt updatedAt name description } }`,
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});
	});

	describe('model operation happy path', () => {
		test('Can Get', async () => {
			const ctx = configure(configFixture as any);

			const response = {
				__typename: 'Todo',
				...serverManagedFields,
				name: 'some name',
				description: 'something something',
			};

			const spy = mockApiResponse({
				data: {
					getTodo: response,
				},
			});

			const client = generateClient<Schema>({ amplify: ctx });

			const { data, errors } = await client.models.Todo.get({ id: 'a1' });

			expect(data).toEqual(expect.objectContaining(response));
			expect(errors).toBeUndefined();
			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('Can Subscribe', done => {
			const ctx = configure(configFixture as any);

			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onCreateNote: noteToSend,
				},
			};

			const graphqlVariables = {
				filter: {
					body: { contains: 'good note' },
				},
			};

			const customHeaders = {
				'subscription-header': 'should-exist',
			};

			const client = generateClient<Schema>({ amplify: ctx });

			const spy = jest.fn(() => from([graphqlMessage]));
			jest.spyOn(AWSAppSyncRealTimeProvider.prototype, 'subscribe').mockImplementation(spy);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			client.models.Note.onCreate({
				filter: graphqlVariables.filter,
				headers: customHeaders,
			}).subscribe({
				next(value) {
					expect(value).toEqual(expect.objectContaining(noteToSend));
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});
	});

	describe('custom client and request headers', () => {
		describe('CRUD', () => {
			let spy: jest.SpyInstance;
			let ctx: AmplifyContext;

			beforeEach(() => {
				ctx = configure(configFixture as any);

				spy = mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							name: 'some name',
							description: 'something something',
						},
					},
				});
			});

			test('with custom client headers', async () => {
				const client = generateClient<Schema>({
					amplify: ctx,
					headers: {
						'client-header': 'should exist',
					},
				});

				await client.models.Todo.get({ id: 'a1' });

				expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			});

			test('with custom client headers - graphql', async () => {
				const headers = {
					'client-header': 'should exist',
				};

				const client = generateClient<Schema>({
					amplify: ctx,
					headers,
				});

				await client.graphql({
					query: /* GraphQL */ `
						query listPosts {
							id
						}
					`,
				});

				const receivedArgs = normalizePostGraphqlCalls(spy)[0][1];
				const receivedHeaders = receivedArgs.options.headers;

				expect(receivedHeaders).toEqual(expect.objectContaining(headers));
			});

			test('with custom client header functions', async () => {
				const client = generateClient<Schema>({
					amplify: ctx,
					headers: async () => ({
						'client-header-function': 'should return this header',
					}),
				});

				await client.models.Todo.get({ id: 'a1' });

				expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			});

			test('with custom client header functions that pass requestOptions', async () => {
				const client = generateClient<Schema>({
					amplify: ctx,
					headers: async requestOptions => ({
						'rq-url': requestOptions?.url || 'should-not-be-present',
						'rq-qs': requestOptions?.queryString || 'should-not-be-present',
						'rq-method': requestOptions?.method || 'should-not-be-present',
					}),
				});

				await client.models.Todo.get({ id: 'a1' });

				expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			});

			test('with custom request headers', async () => {
				const client = generateClient<Schema>({
					amplify: ctx,
					headers: {
						'client-header': 'should not exist',
					},
				});

				await client.models.Todo.get(
					{ id: 'a1' },
					{
						headers: {
							'request-header': 'should exist',
						},
					},
				);

				expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

				expect(spy).toHaveBeenCalledWith(
					expect.any(Object),
					expect.objectContaining({
						options: expect.objectContaining({
							headers: expect.not.objectContaining({
								'client-header': 'should not exist',
							}),
						}),
					}),
				);
			});

			test('with custom request header function', async () => {
				const client = generateClient<Schema>({
					amplify: ctx,
					headers: {
						'client-header': 'should not exist',
					},
				});

				await client.models.Todo.get(
					{ id: 'a1' },
					{
						headers: async () => ({
							'request-header-function': 'should return this header',
						}),
					},
				);

				expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			});

			test('with custom request header function that accept requestOptions', async () => {
				const client = generateClient<Schema>({
					amplify: ctx,
					headers: {
						'client-header': 'should not exist',
					},
				});

				await client.models.Todo.get(
					{ id: 'a1' },
					{
						headers: async requestOptions => ({
							'rq-url': requestOptions?.url || 'should-not-be-present',
							'rq-qs': requestOptions?.queryString || 'should-not-be-present',
							'rq-method': requestOptions?.method || 'should-not-be-present',
						}),
					},
				);

				expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			});
		});

		describe('Subscribe', () => {
			let ctx: AmplifyContext;

			beforeEach(() => {
				ctx = configure(configFixture as any);
			});

			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onCreateNote: noteToSend,
				},
			};

			const graphqlVariables = {
				filter: {
					body: { contains: 'good note' },
				},
			};

			test('with custom headers', done => {
				const customHeaders = {
					'subscription-header': 'should-exist',
				};

				const client = generateClient<Schema>({ amplify: ctx });

				const spy = jest.fn(() => from([graphqlMessage]));
				jest.spyOn(AWSAppSyncRealTimeProvider.prototype, 'subscribe').mockImplementation(spy);

				client.models.Note.onCreate({
					filter: graphqlVariables.filter,
					headers: customHeaders,
				}).subscribe({
					next(value) {
						expectSubWithHeaders(
							spy,
							'onCreateNote',
							graphqlVariables,
							customHeaders,
						);
						expect(value).toEqual(expect.objectContaining(noteToSend));
						done();
					},
					error(error) {
						expect(error).toBeUndefined();
						done('bad news!');
					},
				});
			});

			test('with client-level custom headers', done => {
				const customHeaders = {
					'subscription-header': 'should-exist',
				};

				const client = generateClient<Schema>({
					amplify: ctx,
					headers: customHeaders,
				});

				const spy = jest.fn(() => from([graphqlMessage]));
				jest.spyOn(AWSAppSyncRealTimeProvider.prototype, 'subscribe').mockImplementation(spy);

				client.models.Note.onCreate({
					filter: graphqlVariables.filter,
				}).subscribe({
					next(value) {
						expectSubWithHeaders(
							spy,
							'onCreateNote',
							graphqlVariables,
							customHeaders,
						);
						expect(value).toEqual(expect.objectContaining(noteToSend));
						done();
					},
					error(error) {
						expect(error).toBeUndefined();
						done('bad news!');
					},
				});
			});

			test('with a custom header function', done => {
				const customHeaders = {
					'subscription-header-function': 'should-return-this-header',
				};

				const client = generateClient<Schema>({ amplify: ctx });

				const spy = jest.fn(() => from([graphqlMessage]));
				jest.spyOn(AWSAppSyncRealTimeProvider.prototype, 'subscribe').mockImplementation(spy);

				client.models.Note.onCreate({
					filter: graphqlVariables.filter,
					headers: async () => customHeaders,
				}).subscribe({
					next(value) {
						expectSubWithHeadersFn(spy, 'onCreateNote', graphqlVariables);
						expect(value).toEqual(expect.objectContaining(noteToSend));
						done();
					},
					error(error) {
						expect(error).toBeUndefined();
						done('bad news!');
					},
				});
			});

			test('with a custom header function that accepts requestOptions', done => {
				const client = generateClient<Schema>({ amplify: ctx });

				const spy = jest.fn(() => from([graphqlMessage]));
				jest.spyOn(AWSAppSyncRealTimeProvider.prototype, 'subscribe').mockImplementation(spy);

				client.models.Note.onCreate({
					filter: graphqlVariables.filter,
					headers: async requestOptions => ({
						'rq-url': requestOptions?.url || 'should-not-be-present',
						'rq-qs': requestOptions?.queryString || 'should-not-be-present',
						'rq-method': requestOptions?.method || 'should-not-be-present',
					}),
				}).subscribe({
					next(value) {
						expectSubWithHeadersFn(spy, 'onCreateNote', graphqlVariables);
						expect(value).toEqual(expect.objectContaining(noteToSend));
						done();
					},
					error(error) {
						expect(error).toBeUndefined();
						done('bad news!');
					},
				});
			});
		});
	});

	describe('basic model operations with Amplify configuration options headers', () => {
		let spy: jest.SpyInstance;
		let ctx: AmplifyContext;

		const configHeaders = {
			Authorization: 'amplify-config-auth-token',
		};

		beforeEach(() => {
			ctx = configure(configFixture as any, {
				API: {
					GraphQL: {
						headers: async () => configHeaders,
					},
				},
			});

			spy = mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});
		});

		test('config & client headers', async () => {
			const client = generateClient<Schema>({
				amplify: ctx,
				headers: {
					'client-header': 'should exist',
				},
			});

			await client.models.Todo.get({ id: 'some-id' });

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('custom client headers should not overwrite library config headers', async () => {
			const client = generateClient<Schema>({
				amplify: ctx,
				headers: {
					Authorization: 'client-level-header',
				},
			});

			await client.models.Todo.get({ id: 'some-id' });

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('custom request headers should not overwrite library config headers', async () => {
			const client = generateClient<Schema>({
				amplify: ctx,
			});

			const { data } = await client.models.Todo.get(
				{ id: 'some-id' },
				{
					headers: {
						Authorization: 'request-level-header',
					},
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('subscribe - with custom headers and library config headers', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onCreateNote: noteToSend,
				},
			};

			const graphqlVariables = {
				filter: {
					body: { contains: 'good note' },
				},
			};

			const customHeaders = {
				'subscription-header': 'should-exist',
			};

			const client = generateClient<Schema>({ amplify: ctx });

			const spy = jest.fn(() => from([graphqlMessage]));
			jest.spyOn(AWSAppSyncRealTimeProvider.prototype, 'subscribe').mockImplementation(spy);

			client.models.Note.onCreate({
				filter: graphqlVariables.filter,
				headers: customHeaders,
			}).subscribe({
				async next() {
					await expectSubWithlibraryConfigHeaders(
						spy,
						'onCreateNote',
						graphqlVariables,
						customHeaders,
						configHeaders,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});
	});
});

import * as raw from '../../src';
import { Amplify, AmplifyClassV6 } from '@aws-amplify/core';
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
} from '../utils/index';
import { AWSAppSyncRealTimeProvider } from '../../src/Providers/AWSAppSyncRealTimeProvider';

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

		it('generates `models` property when Amplify.getConfig() returns valid GraphQL provider config', () => {
			Amplify.configure(configFixture); // clear the resource config

			const client = generateClient<Schema>({ amplify: Amplify });

			expect(Object.keys(client.models)).toEqual(expectedModelsProperties);
		});

		it('generates `models` property when Amplify.configure() is called later with a valid GraphQL provider config', async () => {
			Amplify.configure({}); // clear the ResourceConfig mimic Amplify.configure has not been called
			const client = generateClient<Schema>({ amplify: Amplify });

			expect(Object.keys(client.models)).toHaveLength(0);

			Amplify.configure(configFixture);

			expect(Object.keys(client.models)).toEqual(expectedModelsProperties);
		});

		it('generates `models` property throwing error when there is no valid GraphQL provider config can be resolved', () => {
			Amplify.configure({}); // clear the ResourceConfig mimic Amplify.configure has not been called
			const client = generateClient<Schema>({ amplify: Amplify });

			expect(() => {
				client.models.Todo.create({ name: 'todo' });
			}).toThrow(
				'Client could not be generated. This is likely due to `Amplify.configure()` not being called prior to `generateClient()` or because the configuration passed to `Amplify.configure()` is missing GraphQL provider configuration.',
			);
		});
	});

	test('can produce a client bound to an arbitrary amplify object for getConfig()', async () => {
		// TS lies: We don't care what `amplify` is or does. We want want to make sure
		// it shows up in the client in the right spot.

		const fetchAuthSession = jest.fn().mockReturnValue({});
		const getConfig = jest.fn().mockReturnValue({
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
		});

		const apiSpy = jest
			.spyOn((raw.GraphQLAPI as any)._api, 'post')
			.mockReturnValue({
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

		const amplify = {
			Auth: {
				fetchAuthSession,
			},
			getConfig,
		} as unknown as AmplifyClassV6;

		const client = generateClient({ amplify });
		const result = (await client.graphql({
			query: `query Q {
				getWidget {
					__typename id owner createdAt updatedAt someField
				}
			}`,
		})) as any;

		// shouldn't fetch auth for apiKey auth
		expect(fetchAuthSession).not.toHaveBeenCalled();

		expect(getConfig).toHaveBeenCalled();
		expect(apiSpy).toHaveBeenCalled();
	});

	test('can produce a client bound to an arbitrary amplify object for fetchAuthSession()', async () => {
		// TS lies: We don't care what `amplify` is or does. We want want to make sure
		// it shows up in the client in the right spot.

		const fetchAuthSession = jest.fn().mockReturnValue({ credentials: {} });
		const getConfig = jest.fn().mockReturnValue({
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
		});

		const apiSpy = jest
			.spyOn((raw.GraphQLAPI as any)._api, 'post')
			.mockReturnValue({
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

		const amplify = {
			Auth: {
				fetchAuthSession,
			},
			getConfig,
		} as unknown as AmplifyClassV6;

		const client = generateClient({ amplify });
		const result = await client.graphql({
			query: `query Q {
				getWidget {
					__typename id owner createdAt updatedAt someField
				}
			}`,
		});

		// should fetch auth for iam
		expect(fetchAuthSession).toHaveBeenCalled();

		expect(getConfig).toHaveBeenCalled();
		expect(apiSpy).toHaveBeenCalled();
	});

	describe('graphql default auth', () => {
		beforeEach(() => {
			Amplify.configure({
				...configFixture,
				aws_appsync_authenticationType: 'AWS_IAM', // make IAM default
			} as any);

			jest
				.spyOn(Amplify.Auth, 'fetchAuthSession')
				.mockImplementation(async () => {
					return {
						credentials: {
							accessKeyId: 'test',
							secretAccessKey: 'test',
						},
					} as any;
				});
		});

		test('default iam produces expected signingInfo', async () => {
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

			const client = generateClient({ amplify: Amplify });
			await client.graphql({
				query: `query { listTodos { __typename id owner createdAt updatedAt name description } }`,
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});
	});

	// sanity check tests for CRUD and Subscribe model ops
	// exhaustive tests live in https://github.com/aws-amplify/amplify-api-next
	describe('model operation happy path', () => {
		test('Can Get', async () => {
			Amplify.configure(configFixture as any);

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

			const client = generateClient<Schema>({ amplify: Amplify });

			const { data, errors } = await client.models.Todo.get({ id: 'a1' });

			// using `objectContaining` because data will also contain async getters for relational fields
			expect(data).toEqual(expect.objectContaining(response));
			expect(errors).toBeUndefined();
			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('Can Subscribe', done => {
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

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = {
				get() {
					return { subscribe: spy }
				},
				set() {
					// not needed for test mock
				}
			};

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

	/**
	 * The following tests ensure that custom headers can be included with both
	 * API client instantiation and individual model operations. These tests
	 * also validate that request headers will overwrite client headers.
	 *
	 * Note: keeping these in the JS repo for now because behavior depends on implementation
	 * that is deeply nested in the class hierarchy and would be difficult to mock reliably from api-next
	 */
	describe('custom client and request headers', () => {
		// same code path for all CRUD operations; just testing Get
		describe('CRUD', () => {
			let spy: jest.SpyInstance;

			beforeEach(() => {
				Amplify.configure(configFixture as any);

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
					amplify: Amplify,
					headers: {
						'client-header': 'should exist',
					},
				});

				await client.models.Todo.get({
					id: 'a1',
				});

				expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			});

			test('with custom client headers - graphql', async () => {
				const headers = {
					'client-header': 'should exist',
				};

				const client = generateClient<Schema>({
					amplify: Amplify,
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
					amplify: Amplify,
					headers: async () => ({
						'client-header-function': 'should return this header',
					}),
				});

				await client.models.Todo.get({
					id: 'a1',
				});

				expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			});

			test('with custom client header functions that pass requestOptions', async () => {
				const client = generateClient<Schema>({
					amplify: Amplify,
					headers: async requestOptions => ({
						'rq-url': requestOptions?.url || 'should-not-be-present',
						'rq-qs': requestOptions?.queryString || 'should-not-be-present',
						'rq-method': requestOptions?.method || 'should-not-be-present',
					}),
				});

				await client.models.Todo.get({
					id: 'a1',
				});

				expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			});

			test('with custom request headers', async () => {
				const client = generateClient<Schema>({
					amplify: Amplify,
					headers: {
						'client-header': 'should not exist',
					},
				});

				await client.models.Todo.get(
					{
						id: 'a1',
					},
					{
						headers: {
							'request-header': 'should exist',
						},
					},
				);

				expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

				// Request headers should overwrite client headers:
				expect(spy).toHaveBeenCalledWith(
					expect.any(AmplifyClassV6),
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
					amplify: Amplify,
					headers: {
						'client-header': 'should not exist',
					},
				});

				await client.models.Todo.get(
					{
						id: 'a1',
					},
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
					amplify: Amplify,
					headers: {
						'client-header': 'should not exist',
					},
				});

				await client.models.Todo.get(
					{
						id: 'a1',
					},
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

				const client = generateClient<Schema>({ amplify: Amplify });

				const spy = jest.fn(() => from([graphqlMessage]));
				(raw.GraphQLAPI as any).appSyncRealTime = {
					get() {
						return { subscribe: spy }
					},
					set() {
						// not needed for test mock
					}
				};

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
					amplify: Amplify,
					headers: customHeaders,
				});

				const spy = jest.fn(() => from([graphqlMessage]));
				(raw.GraphQLAPI as any).appSyncRealTime = {
					get() {
						return { subscribe: spy }
					},
					set() {
						// not needed for test mock
					}
				};

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

				const client = generateClient<Schema>({ amplify: Amplify });

				const spy = jest.fn(() => from([graphqlMessage]));
				(raw.GraphQLAPI as any).appSyncRealTime = {
					get() {
						return { subscribe: spy }
					},
					set() {
						// not needed for test mock
					}
				};

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
				const client = generateClient<Schema>({ amplify: Amplify });

				const spy = jest.fn(() => from([graphqlMessage]));
				(raw.GraphQLAPI as any).appSyncRealTime = {
					get() {
						return { subscribe: spy }
					},
					set() {
						// not needed for test mock
					}
				};

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

		const configHeaders = {
			Authorization: 'amplify-config-auth-token',
		};

		beforeEach(() => {
			Amplify.configure(configFixture as any, {
				API: {
					GraphQL: {
						// This is what we're testing:
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
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
			});

			await client.models.Todo.get({
				id: 'some-id',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('custom client headers should not overwrite library config headers', async () => {
			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					Authorization: 'client-level-header',
				},
			});

			await client.models.Todo.get({
				id: 'some-id',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('custom request headers should not overwrite library config headers', async () => {
			const client = generateClient<Schema>({
				amplify: Amplify,
			});

			const { data } = await client.models.Todo.get(
				{
					id: 'some-id',
				},
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

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = {
				get() {
					return { subscribe: spy }
				},
				set() {
					// not needed for test mock
				}
			};

			client.models.Note.onCreate({
				filter: graphqlVariables.filter,
				headers: customHeaders,
			}).subscribe({
				async next() {
					// This util checks for the existence of library config headers:
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

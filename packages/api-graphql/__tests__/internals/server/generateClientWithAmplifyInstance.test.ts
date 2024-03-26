import { Amplify, AmplifyClassV6, ResourcesConfig } from '@aws-amplify/core';
import { generateClientWithAmplifyInstance } from '../../../src/internals/server';
import configFixture from '../../fixtures/modeled/amplifyconfiguration';
import { Schema } from '../../fixtures/modeled/schema';
import { V6ClientSSRRequest, V6ClientSSRCookies } from '../../../src/types';
import { mockApiResponse, normalizePostGraphqlCalls } from '../../utils';

const serverManagedFields = {
	id: 'some-id',
	owner: 'wirejobviously',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

const config: ResourcesConfig = {
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
};

describe('server generateClient', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('with cookies', () => {
		test('subscriptions are disabled', () => {
			const getAmplify = async (fn: any) => await fn(Amplify);

			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRCookies<Schema>
			>({
				amplify: getAmplify,
				config: config,
			});

			expect(() => {
				// @ts-expect-error
				client.models.Note.onCreate().subscribe();
			}).toThrow();
		});

		test('can list', async () => {
			Amplify.configure(configFixture as any);
			const config = Amplify.getConfig();

			const spy = mockApiResponse({
				data: {
					listTodos: {
						items: [
							{
								__typename: 'Todo',
								...serverManagedFields,
								name: 'some name',
								description: 'something something',
							},
						],
					},
				},
			});

			const getAmplify = async (fn: any) => await fn(Amplify);

			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRCookies<Schema>
			>({
				amplify: getAmplify,
				config: config,
			});

			const { data } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
			});

			expect(spy).toHaveBeenCalledWith(
				expect.any(AmplifyClassV6),
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'FAKE-KEY',
						}),
						body: {
							query: expect.stringContaining(
								'query ($filter: ModelTodoFilterInput, $sortDirection: ModelSortDirection, $id: ID!, $limit: Int, $nextToken: String)',
							),
							variables: {
								filter: {
									name: {
										contains: 'name',
									},
								},
							},
						},
					}),
				}),
			);

			expect(spy).toHaveBeenCalledWith(
				expect.any(AmplifyClassV6),
				expect.objectContaining({
					options: expect.objectContaining({
						body: expect.objectContaining({
							// match nextToken in selection set
							query: expect.stringMatching(/^\s*nextToken\s*$/m),
						}),
					}),
				}),
			);

			expect(data.length).toBe(1);
			expect(data[0]).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can list with nextToken', async () => {
			Amplify.configure(configFixture as any);
			const config = Amplify.getConfig();

			const spy = mockApiResponse({
				data: {
					listTodos: {
						items: [
							{
								__typename: 'Todo',
								...serverManagedFields,
								name: 'some name',
								description: 'something something',
							},
						],
					},
				},
			});

			const getAmplify = async (fn: any) => await fn(Amplify);

			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRCookies<Schema>
			>({
				amplify: getAmplify,
				config: config,
			});

			const { data } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
				nextToken: 'some-token',
			});

			expect(spy).toHaveBeenCalledWith(
				expect.any(AmplifyClassV6),
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'FAKE-KEY',
						}),
						body: {
							query: expect.stringContaining(
								'query ($filter: ModelTodoFilterInput, $sortDirection: ModelSortDirection, $id: ID!, $limit: Int, $nextToken: String)',
							),
							variables: {
								filter: {
									name: {
										contains: 'name',
									},
								},
								nextToken: 'some-token',
							},
						},
					}),
				}),
			);

			expect(spy).toHaveBeenCalledWith(
				expect.any(AmplifyClassV6),
				expect.objectContaining({
					options: expect.objectContaining({
						body: expect.objectContaining({
							// match nextToken in selection set
							query: expect.stringMatching(/^\s*nextToken\s*$/m),
						}),
					}),
				}),
			);
		});

		test('can list with limit', async () => {
			Amplify.configure(configFixture as any);
			const config = Amplify.getConfig();

			const spy = mockApiResponse({
				data: {
					listTodos: {
						items: [
							{
								__typename: 'Todo',
								...serverManagedFields,
								name: 'some name',
								description: 'something something',
							},
						],
					},
				},
			});

			const getAmplify = async (fn: any) => await fn(Amplify);

			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRCookies<Schema>
			>({
				amplify: getAmplify,
				config: config,
			});

			const { data } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
				limit: 5,
			});

			expect(spy).toHaveBeenCalledWith(
				expect.any(AmplifyClassV6),
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'FAKE-KEY',
						}),
						body: {
							query: expect.stringContaining(
								'query ($filter: ModelTodoFilterInput, $sortDirection: ModelSortDirection, $id: ID!, $limit: Int, $nextToken: String)',
							),
							variables: {
								filter: {
									name: {
										contains: 'name',
									},
								},
								limit: 5,
							},
						},
					}),
				}),
			);

			expect(spy).toHaveBeenCalledWith(
				expect.any(AmplifyClassV6),
				expect.objectContaining({
					options: expect.objectContaining({
						body: expect.objectContaining({
							// match nextToken in selection set
							query: expect.stringMatching(/^\s*nextToken\s*$/m),
						}),
					}),
				}),
			);
		});

		test('can list with sort direction (ascending)', async () => {
			Amplify.configure(configFixture as any);
			const config = Amplify.getConfig();

			const spy = mockApiResponse({
				data: {
					listTodos: {
						items: [
							{
								__typename: 'Todo',
								...serverManagedFields,
								name: 'some name',
								description: 'something something',
							},
						],
					},
				},
			});

			const getAmplify = async (fn: any) => await fn(Amplify);

			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRCookies<Schema>
			>({
				amplify: getAmplify,
				config: config,
			});

			const { data } = await client.models.Todo.list({
				id: 'some-id',
				sortDirection: 'ASC',
			});

			expect(spy).toHaveBeenCalledWith(
				expect.any(AmplifyClassV6),
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'FAKE-KEY',
						}),
						body: {
							query: expect.stringContaining(
								'query ($filter: ModelTodoFilterInput, $sortDirection: ModelSortDirection, $id: ID!, $limit: Int, $nextToken: String)',
							),
							variables: {
								id: 'some-id',
								sortDirection: 'ASC',
							},
						},
					}),
				}),
			);

		test('can list with sort direction (descending)', async () => {
			Amplify.configure(configFixture as any);
			const config = Amplify.getConfig();

			const spy = mockApiResponse({
				data: {
					listTodos: {
						items: [
							{
								__typename: 'Todo',
								...serverManagedFields,
								name: 'some name',
								description: 'something something',
							},
						],
					},
				},
			});

			const getAmplify = async (fn: any) => await fn(Amplify);

			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRCookies<Schema>
			>({
				amplify: getAmplify,
				config: config,
			});

			const { data } = await client.models.Todo.list({
				id: 'some-id',
				sortDirection: 'DESC',
			});

			expect(spy).toHaveBeenCalledWith(
				expect.any(AmplifyClassV6),
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'FAKE-KEY',
						}),
						body: {
							query: expect.stringContaining(
								'query ($filter: ModelTodoFilterInput, $sortDirection: ModelSortDirection, $id: ID!, $limit: Int, $nextToken: String)',
							),
							variables: {
								id: 'some-id',
								sortDirection: 'DESC',
							},
						},
					}),
				}),
			);
		});

		test('can custom query', async () => {
			Amplify.configure(configFixture as any);
			const config = Amplify.getConfig();

			const spy = mockApiResponse({
				data: {
					echo: {
						resultContent: 'echo result content',
					},
				},
			});

			const getAmplify = async (fn: any) => await fn(Amplify);

			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRCookies<Schema>
			>({
				amplify: getAmplify,
				config: config,
			});

			const result = await client.queries.echo({
				argumentContent: 'echo argumentContent value',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			expect(result?.data).toEqual({
				resultContent: 'echo result content',
			});
		});
	});
	describe('with request', () => {
		test('subscriptions are disabled', () => {
			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRRequest<Schema>
			>({
				amplify: null,
				config: config,
			});

			expect(() => {
				// @ts-expect-error
				client.models.Note.onCreate().subscribe();
			}).toThrow();
		});

		test('contextSpec param gets passed through to client.graphql', async () => {
			Amplify.configure(configFixture as any);
			const config = Amplify.getConfig();

			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRRequest<Schema>
			>({
				amplify: null,
				config: config,
			});

			const mockContextSpec = {};

			const spy = jest.spyOn(client, 'graphql').mockImplementation(async () => {
				const result: any = {};
				return result;
			});

			await client.models.Note.list(mockContextSpec);

			expect(spy).toHaveBeenCalledWith(
				mockContextSpec,
				expect.objectContaining({
					query: expect.stringContaining('listNotes'),
				}),
				{},
			);
		});

		test('can custom query', async () => {
			Amplify.configure(configFixture as any);
			const config = Amplify.getConfig();

			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRRequest<Schema>
			>({
				amplify: null,
				config: config,
			});

			const spy = jest.spyOn(client, 'graphql').mockImplementation(async () => {
				const result: any = {};
				return result;
			});

			const mockContextSpec = { token: { value: Symbol('test') } };

			const result = await client.queries.echo(mockContextSpec, {
				argumentContent: 'echo argumentContent value',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});
	});
});

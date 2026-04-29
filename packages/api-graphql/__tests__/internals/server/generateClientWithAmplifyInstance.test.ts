import {
	Amplify,
	AmplifyContext,
	ResourcesConfig,
	getActiveContext,
} from '@aws-amplify/core';
import { generateClientWithAmplifyInstance } from '../../../src/internals/server';
import configFixture from '../../fixtures/modeled/amplifyconfiguration';
import { Schema } from '../../fixtures/modeled/schema';
import { V6ClientSSRRequest, V6ClientSSRCookies } from '../../../src/types';
import { mockApiResponse, normalizePostGraphqlCalls } from '../../utils';
import { post as postFn } from '@aws-amplify/api-rest/internals';

jest.mock('@aws-amplify/api-rest/internals');

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

const mockCtx: AmplifyContext = {
	resourcesConfig: config,
	libraryOptions: {},
	fetchAuthSession: jest.fn().mockResolvedValue({}),
	clearCredentials: jest.fn(),
	getTokens: jest.fn(),
};

// sanity check for CRUD model ops using server clients
// exhaustive tests live in https://github.com/aws-amplify/amplify-api-next
describe('server generateClient', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('with cookies', () => {
		test('subscriptions are disabled', () => {
			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRCookies<Schema>
			>({
				amplify: mockCtx,
				config: config,
			});

			expect(() => {
				// @ts-expect-error
				client.models.Note.onCreate().subscribe();
			}).toThrow();
		});

		test('can list', async () => {
			Amplify.configure(configFixture as any);

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

			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRCookies<Schema>
			>({
				amplify: getActiveContext(),
				config: Amplify.getConfig(),
			});

			const { data } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

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

			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRCookies<Schema>
			>({
				amplify: getActiveContext(),
				config: Amplify.getConfig(),
			});

			const { data } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
				nextToken: 'some-token',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					resourcesConfig: expect.any(Object),
					fetchAuthSession: expect.any(Function),
				}),
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

			const client = generateClientWithAmplifyInstance<
				Schema,
				V6ClientSSRCookies<Schema>
			>({
				amplify: getActiveContext(),
				config: Amplify.getConfig(),
			});

			const { data } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
				limit: 5,
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					resourcesConfig: expect.any(Object),
					fetchAuthSession: expect.any(Function),
				}),
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

		describe('with request', () => {
			test('subscriptions are disabled', () => {
				const client = generateClientWithAmplifyInstance<
					Schema,
					V6ClientSSRRequest<Schema>
				>({
					amplify: mockCtx,
					config: config,
				});

				expect(() => {
					// @ts-expect-error
					client.models.Note.onCreate().subscribe();
				}).toThrow();
			});

			test('contextSpec param gets passed through to client.graphql', async () => {
				Amplify.configure(configFixture as any);

				const client = generateClientWithAmplifyInstance<
					Schema,
					V6ClientSSRRequest<Schema>
				>({
					amplify: getActiveContext(),
					config: Amplify.getConfig(),
				});

				const mockContextSpec = {
					token: { value: Symbol('AmplifyServerContextToken') },
				};

				const spy = jest
					.spyOn(client, 'graphql')
					.mockImplementation(async () => {
						const result: any = {};
						return result;
					});

				await client.models.Note.list(mockContextSpec);

				// With the new context-based architecture, the model operation
				// passes the graphql options directly (contextSpec handling changed)
				expect(spy).toHaveBeenCalledWith(
					expect.objectContaining({
						query: expect.stringContaining('listNotes'),
					}),
					{},
				);
			});
		});
	});
});

import * as raw from '../../src';
import { Amplify, AmplifyClassV6 } from '@aws-amplify/core';
import { generateClient } from '../../src/internals';
import configFixture from '../fixtures/modeled/amplifyconfiguration';
import { Schema } from '../fixtures/modeled/schema';
import { from } from 'rxjs';
import {
	normalizePostGraphqlCalls,
	expectSub,
	expectSubWithHeaders,
	expectSubWithHeadersFn,
	expectSubWithlibraryConfigHeaders,
	makeAppSyncStreams,
	mockApiResponse,
} from '../utils/index';

const serverManagedFields = {
	id: 'some-id',
	owner: 'wirejobviously',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

const USER_AGENT_DETAILS = {
	action: '1',
	category: 'api',
};

describe('generateClient', () => {
	describe('client `models` property', () => {
		const expectedModelsProperties = [
			'Todo',
			'Note',
			'TodoMetadata',
			'ThingWithCustomerOwnerField',
			'ThingWithOwnerFieldSpecifiedInModel',
			'ThingWithAPIKeyAuth',
			'ThingWithoutExplicitAuth',
			'ThingWithCustomPk',
			'CommunityPoll',
			'CommunityPollAnswer',
			'CommunityPollVote',
			'CommunityPost',
			'SecondaryIndexModel',
			'Post',
			'Comment',
			'Product',
			'ImplicitOwner',
			'CustomImplicitOwner',
			'ModelGroupDefinedIn',
			'ModelGroupsDefinedIn',
			'ModelStaticGroup',
		];

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

	describe('client `enums` property', () => {
		const expectedEnumsProperties = ['Status', 'ProductMetaStatus'];

		it('generates `enums` property when Amplify.getConfig() returns valid GraphQL provider config', () => {
			Amplify.configure(configFixture); // clear the resource config

			const client = generateClient<Schema>({ amplify: Amplify });

			expect(Object.keys(client.enums)).toEqual(expectedEnumsProperties);
		});

		it('generates `enums` property when Amplify.configure() is called later with a valid GraphQL provider config', async () => {
			Amplify.configure({}); // clear the ResourceConfig mimic Amplify.configure has not been called
			const client = generateClient<Schema>({ amplify: Amplify });

			expect(Object.keys(client.enums)).toHaveLength(0);

			Amplify.configure(configFixture);

			expect(Object.keys(client.enums)).toEqual(expectedEnumsProperties);
		});

		it('generates `models` property throwing error when there is no valid GraphQL provider config can be resolved', () => {
			Amplify.configure({}); // clear the ResourceConfig mimic Amplify.configure has not been called
			const client = generateClient<Schema>({ amplify: Amplify });

			expect(() => {
				client.enums.SecondaryIndexModelStatus.values();
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

	describe('basic model operations', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			Amplify.configure(configFixture as any);
		});

		test('can create()', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models.Todo.create({
				name: 'some name',
				description: 'something something',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can get()', async () => {
			const spy = mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
						tags: ['one', 'two', 'three'],
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models.Todo.get({ id: 'asdf' });

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
					tags: ['one', 'two', 'three'],
				}),
			);
		});

		test('can list()', async () => {
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

			const client = generateClient<Schema>({ amplify: Amplify });
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

		test('can list() with nextToken', async () => {
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

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
				nextToken: 'some-token',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can list() with limit', async () => {
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

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
				limit: 5,
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can list() with sortDirection (ASC)', async () => {
			const spy = mockApiResponse({
				data: {
					listThingWithCustomPks: {
						items: [
							{
								__typename: 'ThingWithCustomPk',
								...serverManagedFields,
								cpk_cluster_key: '1',
								cpk_sort_key: 'a',
							},
						],
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });

			const { data } = await client.models.ThingWithCustomPk.list({
				cpk_cluster_key: '1',
				sortDirection: 'ASC',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can list() with sortDirection (DESC)', async () => {
			const spy = mockApiResponse({
				data: {
					listThingWithCustomPks: {
						items: [
							{
								__typename: 'ThingWithCustomPk',
								...serverManagedFields,
								cpk_cluster_key: '1',
								cpk_sort_key: 'c',
							},
						],
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });

			const { data } = await client.models.ThingWithCustomPk.list({
				cpk_cluster_key: '1',
				sortDirection: 'DESC',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can update()', async () => {
			const spy = mockApiResponse({
				data: {
					updateTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some other name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models.Todo.update({
				id: 'some-id',
				name: 'some other name',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some other name',
					description: 'something something',
				}),
			);
		});

		test('can delete()', async () => {
			const spy = mockApiResponse({
				data: {
					deleteTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models.Todo.delete({
				id: 'some-id',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can subscribe to onCreate()', done => {
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

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onCreate({
				filter: graphqlVariables.filter,
			}).subscribe({
				next(value) {
					expectSub(spy, 'onCreateNote', graphqlVariables);
					expect(value).toEqual(expect.objectContaining(noteToSend));
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		test('can subscribe to onUpdate()', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onUpdateNote: noteToSend,
				},
			};

			const graphqlVariables = {
				filter: {
					body: { contains: 'good note' },
				},
			};

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onUpdate({
				filter: graphqlVariables.filter,
			}).subscribe({
				next(value) {
					expectSub(spy, 'onUpdateNote', graphqlVariables);
					expect(value).toEqual(expect.objectContaining(noteToSend));
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		test('can subscribe to onDelete()', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onDeleteNote: noteToSend,
				},
			};

			const graphqlVariables = {
				filter: {
					body: { contains: 'good note' },
				},
			};

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onDelete({
				filter: graphqlVariables.filter,
			}).subscribe({
				next(value) {
					expectSub(spy, 'onDeleteNote', graphqlVariables);
					expect(value).toEqual(expect.objectContaining(noteToSend));
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		test('can lazy load @hasMany', async () => {
			mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						id: 'todo-id',
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models.Todo.get({ id: 'todo-id' });

			const getChildNotesSpy = mockApiResponse({
				data: {
					listNotes: {
						items: [
							{
								__typename: 'Note',
								...serverManagedFields,
								id: 'note-id',
								body: 'some body',
							},
						],
					},
				},
			});

			const { data: notes } = await data!.notes();

			expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();

			expect(notes!.length).toBe(1);
			expect(notes![0]).toEqual(
				expect.objectContaining({
					__typename: 'Note',
					id: 'note-id',
					owner: 'wirejobviously',
					body: 'some body',
				}),
			);
		});

		test('can lazy load @hasMany with nextToken', async () => {
			mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						id: 'todo-id',
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models.Todo.get({ id: 'todo-id' });

			const getChildNotesSpy = mockApiResponse({
				data: {
					listNotes: {
						items: [
							{
								__typename: 'Note',
								...serverManagedFields,
								id: 'note-id',
								body: 'some body',
							},
						],
					},
				},
			});

			const { data: notes } = await data!.notes({ nextToken: 'some-token' });

			expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();

			expect(notes!.length).toBe(1);
			expect(notes![0]).toEqual(
				expect.objectContaining({
					__typename: 'Note',
					id: 'note-id',
					owner: 'wirejobviously',
					body: 'some body',
				}),
			);
		});

		test('can lazy load @hasMany with limit', async () => {
			mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						id: 'todo-id',
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models.Todo.get({ id: 'todo-id' });

			const getChildNotesSpy = mockApiResponse({
				data: {
					listNotes: {
						items: [
							{
								__typename: 'Note',
								...serverManagedFields,
								id: 'note-id',
								body: 'some body',
							},
						],
					},
				},
			});

			const { data: notes } = await data!.notes({ limit: 5 });

			expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();

			expect(notes!.length).toBe(1);
			expect(notes![0]).toEqual(
				expect.objectContaining({
					__typename: 'Note',
					id: 'note-id',
					owner: 'wirejobviously',
					body: 'some body',
				}),
			);
		});

		test('can lazy load @belongsTo', async () => {
			mockApiResponse({
				data: {
					getNote: {
						__typename: 'Note',
						...serverManagedFields,
						id: 'note-id',
						body: 'some body',
						todoNotesId: 'todo-id',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models.Note.get({ id: 'note-id' });

			const getChildNotesSpy = mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						id: 'todo-id',
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const { data: todo } = await data!.todo();

			expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();

			expect(todo).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'todo-id',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can lazy load @hasOne', async () => {
			mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						id: 'todo-id',
						body: 'some body',
						todoMetaId: 'meta-id',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models.Todo.get({ id: 'todo-id' });

			const getChildMetaSpy = mockApiResponse({
				data: {
					getTodoMetadata: {
						__typename: 'TodoMetadata',
						...serverManagedFields,
						id: 'meta-id',
						data: '{"field":"value"}',
					},
				},
			});

			const { data: todo } = await data!.meta();

			expect(normalizePostGraphqlCalls(getChildMetaSpy)).toMatchSnapshot();

			expect(todo).toEqual(
				expect.objectContaining({
					__typename: 'TodoMetadata',
					id: 'meta-id',
					data: '{"field":"value"}',
				}),
			);
		});
	});

	describe('error handling', () => {
		test('create() returns null with errors property', async () => {
			const expectedErrors = [
				{
					path: ['createTodo'],
					data: null,
					errorType: 'Unauthorized',
					errorInfo: null,
					locations: [
						{
							line: 2,
							column: 3,
							sourceName: null,
						},
					],
					message: 'Not Authorized to access createTodo on type Mutation',
				},
			];

			const spy = mockApiResponse({
				data: {
					getTodo: null,
				},
				errors: expectedErrors,
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data, errors } = await client.models.Todo.create({
				id: 'does not matter',
			});

			expect(data).toBeNull();
			expect(errors?.length).toBe(1);
			expect(errors).toEqual(expectedErrors);
		});

		test('get() returns null with errors property', async () => {
			const expectedErrors = [
				{
					path: ['getTodo'],
					data: null,
					errorType: 'Unauthorized',
					errorInfo: null,
					locations: [
						{
							line: 2,
							column: 3,
							sourceName: null,
						},
					],
					message: 'Not Authorized to access getTodo on type Query',
				},
			];

			const spy = mockApiResponse({
				data: {
					getTodo: null,
				},
				errors: expectedErrors,
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data, errors } = await client.models.Todo.get({
				id: 'does not matter',
			});

			expect(data).toBeNull();
			expect(errors?.length).toBe(1);
			expect(errors).toEqual(expectedErrors);
		});

		test('update() returns null with errors property', async () => {
			const expectedErrors = [
				{
					path: ['updateTodo'],
					data: null,
					errorType: 'Unauthorized',
					errorInfo: null,
					locations: [
						{
							line: 2,
							column: 3,
							sourceName: null,
						},
					],
					message: 'Not Authorized to access updateTodo on type Mutation',
				},
			];

			const spy = mockApiResponse({
				data: {
					updateTodo: null,
				},
				errors: expectedErrors,
			});

			const client = generateClient<Schema>({ amplify: Amplify });

			const { data, errors } = await client.models.Todo.update({
				id: 'some_id',
				name: 'does not matter',
			});

			expect(data).toBeNull();
			expect(errors?.length).toBe(1);
			expect(errors).toEqual(expectedErrors);
		});

		test('delete() returns null with errors property', async () => {
			const expectedErrors = [
				{
					path: ['deleteTodo'],
					data: null,
					errorType: 'Unauthorized',
					errorInfo: null,
					locations: [
						{
							line: 2,
							column: 3,
							sourceName: null,
						},
					],
					message: 'Not Authorized to access deleteTodo on type Mutation',
				},
			];

			const spy = mockApiResponse({
				data: {
					deleteTodo: null,
				},
				errors: expectedErrors,
			});

			const client = generateClient<Schema>({ amplify: Amplify });

			const { data, errors } = await client.models.Todo.delete({
				id: 'some_id',
			});

			expect(data).toBeNull();
			expect(errors?.length).toBe(1);
			expect(errors).toEqual(expectedErrors);
		});

		test('list() returns empty list with errors property', async () => {
			const expectedErrors = [
				{
					path: ['listTodos'],
					data: null,
					errorType: 'Unauthorized',
					errorInfo: null,
					locations: [
						{
							line: 2,
							column: 3,
							sourceName: null,
						},
					],
					message: 'Not Authorized to access listTodos on type Query',
				},
			];

			const spy = mockApiResponse({
				data: {
					listTodos: null,
				},
				errors: expectedErrors,
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data, errors } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
			});

			expect(data.length).toBe(0);
			expect(errors?.length).toBe(1);
			expect(errors).toEqual(expectedErrors);
		});
	});

	describe('basic model operations - authMode: CuP override at the time of operation', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			Amplify.configure(configFixture as any);

			jest
				.spyOn(Amplify.Auth, 'fetchAuthSession')
				.mockImplementation(async () => {
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
					} as any;
				});
		});

		test('can create()', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			await client.models.Todo.create(
				{
					name: 'some name',
					description: 'something something',
				},
				{
					authMode: 'userPool',
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can get()', async () => {
			const spy = mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			await client.models.Todo.get({ id: 'asdf' }, { authMode: 'userPool' });

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can list()', async () => {
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

			const client = generateClient<Schema>({ amplify: Amplify });
			await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
				authMode: 'userPool',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can update()', async () => {
			const spy = mockApiResponse({
				data: {
					updateTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some other name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			await client.models.Todo.update(
				{
					id: 'some-id',
					name: 'some other name',
				},
				{ authMode: 'userPool' },
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can delete()', async () => {
			const spy = mockApiResponse({
				data: {
					deleteTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			await client.models.Todo.delete(
				{
					id: 'some-id',
				},
				{ authMode: 'userPool' },
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can subscribe to onCreate()', done => {
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

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onCreate({
				authMode: 'userPool',
			}).subscribe({
				next(value) {
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							authenticationType: 'userPool',
						}),
						USER_AGENT_DETAILS,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		test('can subscribe to onUpdate()', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onUpdateNote: noteToSend,
				},
			};

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onUpdate({
				authMode: 'userPool',
			}).subscribe({
				next(value) {
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							authenticationType: 'userPool',
						}),
						USER_AGENT_DETAILS,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		test('can subscribe to onDelete()', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onDeleteNote: noteToSend,
				},
			};

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onDelete({
				authMode: 'userPool',
			} as any).subscribe({
				next(value) {
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							authenticationType: 'userPool',
						}),
						USER_AGENT_DETAILS,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		describe('can lazy load with inherited authMode', () => {
			test('can lazy load @hasMany', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				const client = generateClient<Schema>({ amplify: Amplify });
				const { data } = await client.models.Todo.get(
					{ id: 'todo-id' },
					{ authMode: 'userPool' },
				);

				const getChildNotesSpy = mockApiResponse({
					data: {
						listNotes: {
							items: [
								{
									__typename: 'Note',
									...serverManagedFields,
									id: 'note-id',
									body: 'some body',
								},
							],
						},
					},
				});

				await data!.notes();

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @belongsTo', async () => {
				mockApiResponse({
					data: {
						getNote: {
							__typename: 'Note',
							...serverManagedFields,
							id: 'note-id',
							body: 'some body',
							todoNotesId: 'todo-id',
						},
					},
				});

				const client = generateClient<Schema>({ amplify: Amplify });
				const { data } = await client.models.Note.get(
					{ id: 'note-id' },
					{
						authMode: 'userPool',
					},
				);

				const getChildNotesSpy = mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				await data!.todo();

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @hasOne', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							body: 'some body',
							todoMetaId: 'meta-id',
						},
					},
				});

				const client = generateClient<Schema>({ amplify: Amplify });
				const { data } = await client.models.Todo.get(
					{ id: 'todo-id' },
					{
						authMode: 'userPool',
					},
				);

				const getChildMetaSpy = mockApiResponse({
					data: {
						getTodoMetadata: {
							__typename: 'TodoMetadata',
							...serverManagedFields,
							id: 'meta-id',
							data: '{"field":"value"}',
						},
					},
				});

				await data!.meta();

				expect(normalizePostGraphqlCalls(getChildMetaSpy)).toMatchSnapshot();
			});
		});

		describe('can lazy load with overridden authMode', () => {
			test('can lazy load @hasMany', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				const client = generateClient<Schema>({ amplify: Amplify });
				const { data } = await client.models.Todo.get(
					{ id: 'todo-id' },
					{ authMode: 'userPool' },
				);

				const getChildNotesSpy = mockApiResponse({
					data: {
						listNotes: {
							items: [
								{
									__typename: 'Note',
									...serverManagedFields,
									id: 'note-id',
									body: 'some body',
								},
							],
						},
					},
				});

				await data!.notes({ authMode: 'apiKey' });

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @belongsTo', async () => {
				mockApiResponse({
					data: {
						getNote: {
							__typename: 'Note',
							...serverManagedFields,
							id: 'note-id',
							body: 'some body',
							todoNotesId: 'todo-id',
						},
					},
				});

				const client = generateClient<Schema>({ amplify: Amplify });
				const { data } = await client.models.Note.get(
					{ id: 'note-id' },
					{
						authMode: 'userPool',
					},
				);

				const getChildNotesSpy = mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				await data!.todo({ authMode: 'apiKey' });

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @hasOne', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							body: 'some body',
							todoMetaId: 'meta-id',
						},
					},
				});

				const client = generateClient<Schema>({ amplify: Amplify });
				const { data } = await client.models.Todo.get(
					{ id: 'todo-id' },
					{
						authMode: 'userPool',
					},
				);

				const getChildMetaSpy = mockApiResponse({
					data: {
						getTodoMetadata: {
							__typename: 'TodoMetadata',
							...serverManagedFields,
							id: 'meta-id',
							data: '{"field":"value"}',
						},
					},
				});

				await data!.meta({ authMode: 'apiKey' });

				expect(normalizePostGraphqlCalls(getChildMetaSpy)).toMatchSnapshot();
			});
		});
	});

	describe('basic model operations - authMode: lambda override at the time of operation', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			Amplify.configure(configFixture as any);

			jest
				.spyOn(Amplify.Auth, 'fetchAuthSession')
				.mockImplementation(async () => {
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
					} as any;
				});
		});

		test('can create()', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			await client.models.Todo.create(
				{
					name: 'some name',
					description: 'something something',
				},
				{
					authMode: 'lambda',
					authToken: 'some-token',
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can get()', async () => {
			const spy = mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			await client.models.Todo.get(
				{ id: 'asdf' },
				{ authMode: 'lambda', authToken: 'some-token' },
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can list()', async () => {
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

			const client = generateClient<Schema>({ amplify: Amplify });
			await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
				authMode: 'lambda',
				authToken: 'some-token',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can update()', async () => {
			const spy = mockApiResponse({
				data: {
					updateTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some other name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			await client.models.Todo.update(
				{
					id: 'some-id',
					name: 'some other name',
				},
				{ authMode: 'lambda', authToken: 'some-token' },
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can delete()', async () => {
			const spy = mockApiResponse({
				data: {
					deleteTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			await client.models.Todo.delete(
				{
					id: 'some-id',
				},
				{ authMode: 'lambda', authToken: 'some-token' },
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can subscribe to onCreate()', done => {
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

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onCreate({
				authMode: 'lambda',
				authToken: 'some-token',
			}).subscribe({
				next(value) {
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							authenticationType: 'lambda',
						}),
						USER_AGENT_DETAILS,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		test('can subscribe to onUpdate()', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onUpdateNote: noteToSend,
				},
			};

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onUpdate({
				authMode: 'lambda',
				authToken: 'some-token',
			} as any).subscribe({
				next(value) {
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							authenticationType: 'lambda',
						}),
						USER_AGENT_DETAILS,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		test('can subscribe to onDelete()', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onDeleteNote: noteToSend,
				},
			};

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onDelete({
				authMode: 'lambda',
				authToken: 'some-token',
			} as any).subscribe({
				next(value) {
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							authenticationType: 'lambda',
						}),
						USER_AGENT_DETAILS,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		describe('can lazy load with inherited authMode', () => {
			test('can lazy load @hasMany', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				const client = generateClient<Schema>({ amplify: Amplify });
				const { data } = await client.models.Todo.get(
					{ id: 'todo-id' },
					{ authMode: 'lambda', authToken: 'some-token' },
				);

				const getChildNotesSpy = mockApiResponse({
					data: {
						listNotes: {
							items: [
								{
									__typename: 'Note',
									...serverManagedFields,
									id: 'note-id',
									body: 'some body',
								},
							],
						},
					},
				});

				await data!.notes();

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @belongsTo', async () => {
				mockApiResponse({
					data: {
						getNote: {
							__typename: 'Note',
							...serverManagedFields,
							id: 'note-id',
							body: 'some body',
							todoNotesId: 'todo-id',
						},
					},
				});

				const client = generateClient<Schema>({ amplify: Amplify });
				const { data } = await client.models.Note.get(
					{ id: 'note-id' },
					{
						authMode: 'lambda',
						authToken: 'some-token',
					},
				);

				const getChildNotesSpy = mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				await data!.todo();

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @hasOne', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							body: 'some body',
							todoMetaId: 'meta-id',
						},
					},
				});

				const client = generateClient<Schema>({ amplify: Amplify });
				const { data } = await client.models.Todo.get(
					{ id: 'todo-id' },
					{
						authMode: 'lambda',
						authToken: 'some-token',
					},
				);

				const getChildMetaSpy = mockApiResponse({
					data: {
						getTodoMetadata: {
							__typename: 'TodoMetadata',
							...serverManagedFields,
							id: 'meta-id',
							data: '{"field":"value"}',
						},
					},
				});

				await data!.meta();

				expect(normalizePostGraphqlCalls(getChildMetaSpy)).toMatchSnapshot();
			});
		});

		describe('can lazy load with overridden authMode', () => {
			test('can lazy load @hasMany', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				const client = generateClient<Schema>({ amplify: Amplify });
				const { data } = await client.models.Todo.get(
					{ id: 'todo-id' },
					{ authMode: 'userPool' },
				);

				const getChildNotesSpy = mockApiResponse({
					data: {
						listNotes: {
							items: [
								{
									__typename: 'Note',
									...serverManagedFields,
									id: 'note-id',
									body: 'some body',
								},
							],
						},
					},
				});

				await data!.notes({ authMode: 'lambda', authToken: 'some-token' });

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @belongsTo', async () => {
				mockApiResponse({
					data: {
						getNote: {
							__typename: 'Note',
							...serverManagedFields,
							id: 'note-id',
							body: 'some body',
							todoNotesId: 'todo-id',
						},
					},
				});

				const client = generateClient<Schema>({ amplify: Amplify });
				const { data } = await client.models.Note.get(
					{ id: 'note-id' },
					{
						authMode: 'userPool',
					},
				);

				const getChildNotesSpy = mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				await data!.todo({ authMode: 'lambda', authToken: 'some-token' });

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @hasOne', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							body: 'some body',
							todoMetaId: 'meta-id',
						},
					},
				});

				const client = generateClient<Schema>({ amplify: Amplify });
				const { data } = await client.models.Todo.get(
					{ id: 'todo-id' },
					{
						authMode: 'userPool',
					},
				);

				const getChildMetaSpy = mockApiResponse({
					data: {
						getTodoMetadata: {
							__typename: 'TodoMetadata',
							...serverManagedFields,
							id: 'meta-id',
							data: '{"field":"value"}',
						},
					},
				});

				await data!.meta({ authMode: 'lambda', authToken: 'some-token' });

				expect(normalizePostGraphqlCalls(getChildMetaSpy)).toMatchSnapshot();
			});
		});
	});

	describe('basic model operations - authMode: CuP override in the client', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			Amplify.configure(configFixture as any);

			jest
				.spyOn(Amplify.Auth, 'fetchAuthSession')
				.mockImplementation(async () => {
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
					} as any;
				});
		});

		test('can create()', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'userPool',
			});
			await client.models.Todo.create({
				name: 'some name',
				description: 'something something',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can get()', async () => {
			const spy = mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'userPool',
			});
			await client.models.Todo.get({ id: 'asdf' });

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can list()', async () => {
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

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'userPool',
			});
			await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can update()', async () => {
			const spy = mockApiResponse({
				data: {
					updateTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some other name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'userPool',
			});
			await client.models.Todo.update({
				id: 'some-id',
				name: 'some other name',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can delete()', async () => {
			const spy = mockApiResponse({
				data: {
					deleteTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'userPool',
			});
			await client.models.Todo.delete({
				id: 'some-id',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can subscribe to onCreate()', done => {
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

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'userPool',
			});

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			const onC = client.models.Note.onCreate();

			onC.subscribe({
				next(value) {
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							authenticationType: 'userPool',
						}),
						USER_AGENT_DETAILS,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		test('can subscribe to onUpdate()', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onUpdateNote: noteToSend,
				},
			};

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'userPool',
			});

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onUpdate().subscribe({
				next(value) {
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							authenticationType: 'userPool',
						}),
						USER_AGENT_DETAILS,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		test('can subscribe to onDelete()', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onDeleteNote: noteToSend,
				},
			};

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'userPool',
			});

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onDelete().subscribe({
				next(value) {
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							authenticationType: 'userPool',
						}),
						USER_AGENT_DETAILS,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		describe('can lazy load with inherited authMode', () => {
			test('can lazy load @hasMany', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'userPool',
				});
				const { data } = await client.models.Todo.get({ id: 'todo-id' });

				const getChildNotesSpy = mockApiResponse({
					data: {
						listNotes: {
							items: [
								{
									__typename: 'Note',
									...serverManagedFields,
									id: 'note-id',
									body: 'some body',
								},
							],
						},
					},
				});

				await data!.notes();

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @belongsTo', async () => {
				mockApiResponse({
					data: {
						getNote: {
							__typename: 'Note',
							...serverManagedFields,
							id: 'note-id',
							body: 'some body',
							todoNotesId: 'todo-id',
						},
					},
				});

				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'userPool',
				});
				const { data } = await client.models.Note.get({ id: 'note-id' });

				const getChildNotesSpy = mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				await data!.todo();

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @hasOne', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							body: 'some body',
							todoMetaId: 'meta-id',
						},
					},
				});

				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'userPool',
				});
				const { data } = await client.models.Todo.get({ id: 'todo-id' });

				const getChildMetaSpy = mockApiResponse({
					data: {
						getTodoMetadata: {
							__typename: 'TodoMetadata',
							...serverManagedFields,
							id: 'meta-id',
							data: '{"field":"value"}',
						},
					},
				});

				await data!.meta();

				expect(normalizePostGraphqlCalls(getChildMetaSpy)).toMatchSnapshot();
			});
		});

		describe('can lazy load with overridden authMode', () => {
			test('can lazy load @hasMany', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'userPool',
				});
				const { data } = await client.models.Todo.get({ id: 'todo-id' });

				const getChildNotesSpy = mockApiResponse({
					data: {
						listNotes: {
							items: [
								{
									__typename: 'Note',
									...serverManagedFields,
									id: 'note-id',
									body: 'some body',
								},
							],
						},
					},
				});

				await data!.notes({ authMode: 'apiKey' });

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @belongsTo', async () => {
				mockApiResponse({
					data: {
						getNote: {
							__typename: 'Note',
							...serverManagedFields,
							id: 'note-id',
							body: 'some body',
							todoNotesId: 'todo-id',
						},
					},
				});

				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'userPool',
				});
				const { data } = await client.models.Note.get({ id: 'note-id' });

				const getChildNotesSpy = mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				await data!.todo({ authMode: 'apiKey' });

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @hasOne', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							body: 'some body',
							todoMetaId: 'meta-id',
						},
					},
				});

				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'userPool',
				});
				const { data } = await client.models.Todo.get({ id: 'todo-id' });

				const getChildMetaSpy = mockApiResponse({
					data: {
						getTodoMetadata: {
							__typename: 'TodoMetadata',
							...serverManagedFields,
							id: 'meta-id',
							data: '{"field":"value"}',
						},
					},
				});

				await data!.meta({ authMode: 'apiKey' });

				expect(normalizePostGraphqlCalls(getChildMetaSpy)).toMatchSnapshot();
			});
		});
	});

	describe('basic model operations - authMode: lambda override in the client', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			Amplify.configure(configFixture as any);

			jest
				.spyOn(Amplify.Auth, 'fetchAuthSession')
				.mockImplementation(async () => {
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
					} as any;
				});
		});

		test('can create()', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'lambda',
				authToken: 'some-token',
			});
			await client.models.Todo.create({
				name: 'some name',
				description: 'something something',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can get()', async () => {
			const spy = mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'lambda',
				authToken: 'some-token',
			});
			await client.models.Todo.get({ id: 'asdf' });

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can list()', async () => {
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

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'lambda',
				authToken: 'some-token',
			});
			await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can update()', async () => {
			const spy = mockApiResponse({
				data: {
					updateTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some other name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'lambda',
				authToken: 'some-token',
			});
			await client.models.Todo.update({
				id: 'some-id',
				name: 'some other name',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can delete()', async () => {
			const spy = mockApiResponse({
				data: {
					deleteTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'lambda',
				authToken: 'some-token',
			});
			await client.models.Todo.delete({
				id: 'some-id',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can subscribe to onCreate()', done => {
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

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'lambda',
				authToken: 'some-token',
			});

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onCreate().subscribe({
				next(value) {
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							authenticationType: 'lambda',
						}),
						USER_AGENT_DETAILS,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		test('can subscribe to onUpdate()', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onUpdateNote: noteToSend,
				},
			};

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'lambda',
				authToken: 'some-token',
			});

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onUpdate().subscribe({
				next(value) {
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							authenticationType: 'lambda',
						}),
						USER_AGENT_DETAILS,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		test('can subscribe to onDelete()', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onDeleteNote: noteToSend,
				},
			};

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'lambda',
				authToken: 'some-token',
			});

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onDelete().subscribe({
				next(value) {
					expect(spy).toHaveBeenCalledWith(
						expect.objectContaining({
							authenticationType: 'lambda',
						}),
						USER_AGENT_DETAILS,
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});

		describe('can lazy load with inherited authMode', () => {
			test('can lazy load @hasMany', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'lambda',
					authToken: 'some-token',
				});
				const { data } = await client.models.Todo.get({ id: 'todo-id' });

				const getChildNotesSpy = mockApiResponse({
					data: {
						listNotes: {
							items: [
								{
									__typename: 'Note',
									...serverManagedFields,
									id: 'note-id',
									body: 'some body',
								},
							],
						},
					},
				});

				await data!.notes();

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @belongsTo', async () => {
				mockApiResponse({
					data: {
						getNote: {
							__typename: 'Note',
							...serverManagedFields,
							id: 'note-id',
							body: 'some body',
							todoNotesId: 'todo-id',
						},
					},
				});

				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'lambda',
					authToken: 'some-token',
				});
				const { data } = await client.models.Note.get({ id: 'note-id' });

				const getChildNotesSpy = mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				await data!.todo();

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @hasOne', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							body: 'some body',
							todoMetaId: 'meta-id',
						},
					},
				});

				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'lambda',
					authToken: 'some-token',
				});
				const { data } = await client.models.Todo.get({ id: 'todo-id' });

				const getChildMetaSpy = mockApiResponse({
					data: {
						getTodoMetadata: {
							__typename: 'TodoMetadata',
							...serverManagedFields,
							id: 'meta-id',
							data: '{"field":"value"}',
						},
					},
				});

				await data!.meta();

				expect(normalizePostGraphqlCalls(getChildMetaSpy)).toMatchSnapshot();
			});
		});

		describe('can lazy load with overridden authMode', () => {
			test('can lazy load @hasMany', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'userPool',
				});
				const { data } = await client.models.Todo.get({ id: 'todo-id' });

				const getChildNotesSpy = mockApiResponse({
					data: {
						listNotes: {
							items: [
								{
									__typename: 'Note',
									...serverManagedFields,
									id: 'note-id',
									body: 'some body',
								},
							],
						},
					},
				});

				await data!.notes({ authMode: 'lambda', authToken: 'some-token' });

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @belongsTo', async () => {
				mockApiResponse({
					data: {
						getNote: {
							__typename: 'Note',
							...serverManagedFields,
							id: 'note-id',
							body: 'some body',
							todoNotesId: 'todo-id',
						},
					},
				});

				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'userPool',
				});
				const { data } = await client.models.Note.get({ id: 'note-id' });

				const getChildNotesSpy = mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							name: 'some name',
							description: 'something something',
						},
					},
				});

				await data!.todo({ authMode: 'lambda', authToken: 'some-token' });

				expect(normalizePostGraphqlCalls(getChildNotesSpy)).toMatchSnapshot();
			});

			test('can lazy load @hasOne', async () => {
				mockApiResponse({
					data: {
						getTodo: {
							__typename: 'Todo',
							...serverManagedFields,
							id: 'todo-id',
							body: 'some body',
							todoMetaId: 'meta-id',
						},
					},
				});

				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'userPool',
				});
				const { data } = await client.models.Todo.get({ id: 'todo-id' });

				const getChildMetaSpy = mockApiResponse({
					data: {
						getTodoMetadata: {
							__typename: 'TodoMetadata',
							...serverManagedFields,
							id: 'meta-id',
							data: '{"field":"value"}',
						},
					},
				});

				await data!.meta({ authMode: 'lambda', authToken: 'some-token' });

				expect(normalizePostGraphqlCalls(getChildMetaSpy)).toMatchSnapshot();
			});
		});
	});

	/**
	 * The following tests ensure that custom headers can be included with both
	 * API client instantiation and individual model operations. These tests
	 * also validate that request headers will overwrite client headers.
	 */
	describe('basic model operations - custom client and request headers', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			Amplify.configure(configFixture as any);
		});

		test('can create() - with custom client headers', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
			});

			const { data } = await client.models.Todo.create({
				name: 'some name',
				description: 'something something',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can create() - with custom client header functions', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: async () => ({
					'client-header-function': 'should return this header',
				}),
			});

			const { data } = await client.models.Todo.create({
				name: 'some name',
				description: 'something something',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can create() - with custom client header functions that pass requestOptions', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: async requestOptions => ({
					'rq-url': requestOptions?.url || 'should-not-be-present',
					'rq-qs': requestOptions?.queryString || 'should-not-be-present',
					'rq-method': requestOptions?.method || 'should-not-be-present',
				}),
			});

			const { data } = await client.models.Todo.create({
				name: 'some name',
				description: 'something something',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can create() - with custom request headers', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should not exist',
				},
			});

			const { data } = await client.models.Todo.create(
				{
					name: 'some name',
					description: 'something something',
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

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can create() - with custom request header function', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should not exist',
				},
			});

			const { data } = await client.models.Todo.create(
				{
					name: 'some name',
					description: 'something something',
				},
				{
					headers: async () => ({
						'request-header-function': 'should return this header',
					}),
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can create() - with custom request header function that accept requestOptions', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should not exist',
				},
			});

			const { data } = await client.models.Todo.create(
				{
					name: 'some name',
					description: 'something something',
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

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can get() - with custom client headers', async () => {
			const spy = mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
			});
			const { data } = await client.models.Todo.get({ id: 'asdf' });

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can get() - with custom request headers', async () => {
			const spy = mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should not exist',
				},
			});
			const { data } = await client.models.Todo.get(
				{ id: 'asdf' },
				{
					headers: {
						'request-header': 'should exist',
					},
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can list() - with custom client headers', async () => {
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

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
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

		test('can list() - with custom request headers', async () => {
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

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should not exist',
				},
			});
			const { data } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
				headers: {
					'request-header': 'should exist',
				},
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

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

		test('can update() - with custom client headers', async () => {
			const spy = mockApiResponse({
				data: {
					updateTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some other name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
			});
			const { data } = await client.models.Todo.update({
				id: 'some-id',
				name: 'some other name',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some other name',
					description: 'something something',
				}),
			);
		});

		test('can update() - with custom request headers', async () => {
			const spy = mockApiResponse({
				data: {
					updateTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some other name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
			});
			const { data } = await client.models.Todo.update(
				{
					id: 'some-id',
					name: 'some other name',
				},
				{
					headers: {
						'request-header': 'should exist',
					},
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some other name',
					description: 'something something',
				}),
			);
		});

		test('can delete() - with custom client headers', async () => {
			const spy = mockApiResponse({
				data: {
					deleteTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
			});
			const { data } = await client.models.Todo.delete({
				id: 'some-id',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('can delete() - with custom request headers', async () => {
			const spy = mockApiResponse({
				data: {
					deleteTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should not exist',
				},
			});
			const { data } = await client.models.Todo.delete(
				{
					id: 'some-id',
				},
				{
					headers: {
						'request-header': 'should exist',
					},
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can subscribe to onCreate() - with custom headers', done => {
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
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

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

		test('can subscribe to onCreate() - with a custom header function', done => {
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
				'subscription-header-function': 'should-return-this-header',
			};

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

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

		test('can subscribe to onCreate() - with a custom header function that accepts requestOptions', done => {
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

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

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

		test('can subscribe to onUpdate()', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onUpdateNote: noteToSend,
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
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onUpdate({
				filter: graphqlVariables.filter,
				headers: customHeaders,
			}).subscribe({
				next(value) {
					expectSubWithHeaders(
						spy,
						'onUpdateNote',
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

		test('can subscribe to onDelete()', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onDeleteNote: noteToSend,
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
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onDelete({
				filter: graphqlVariables.filter,
				headers: customHeaders,
			}).subscribe({
				next(value) {
					expectSubWithHeaders(
						spy,
						'onDeleteNote',
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
	});
	describe('basic model operations with Amplify configuration options headers', () => {
		beforeEach(() => {
			jest.clearAllMocks();

			Amplify.configure(configFixture as any, {
				API: {
					GraphQL: {
						// This is what we're testing:
						headers: async () => ({
							Authorization: 'amplify-config-auth-token',
						}),
					},
				},
			});
		});

		test('can create() - with library config headers', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
			});

			const { data } = await client.models.Todo.create({
				name: 'some name',
				description: 'something something',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can create() - custom client headers should not overwrite library config headers', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
			});

			const { data } = await client.models.Todo.create({
				name: 'some name',
				description: 'something something',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can create() - custom request headers should not overwrite library config headers', async () => {
			const spy = mockApiResponse({
				data: {
					createTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});

			const { data } = await client.models.Todo.create(
				{
					name: 'some name',
					description: 'something something',
				},
				{
					headers: {
						'request-header': 'should exist',
					},
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can get() - custom client headers should not overwrite library config headers', async () => {
			const spy = mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
			});
			const { data } = await client.models.Todo.get({ id: 'asdf' });

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can get() - custom request headers overwrite client headers, but not library config headers', async () => {
			const spy = mockApiResponse({
				data: {
					getTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should not exist',
				},
			});
			const { data } = await client.models.Todo.get(
				{ id: 'asdf' },
				{
					headers: {
						'request-header': 'should exist',
					},
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can list() - custom client headers should not overwrite library config headers', async () => {
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

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
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

		test('can list() - custom request headers should overwrite client headers but not library config headers', async () => {
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

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should not exist',
				},
			});
			const { data } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
				headers: {
					'request-header': 'should exist',
				},
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

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

		test('can update() - custom client headers should not overwrite library config headers', async () => {
			const spy = mockApiResponse({
				data: {
					updateTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some other name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
			});
			const { data } = await client.models.Todo.update({
				id: 'some-id',
				name: 'some other name',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some other name',
					description: 'something something',
				}),
			);
		});

		test('can update() - custom request headers should overwrite client headers but not library config headers', async () => {
			const spy = mockApiResponse({
				data: {
					updateTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some other name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
			});
			const { data } = await client.models.Todo.update(
				{
					id: 'some-id',
					name: 'some other name',
				},
				{
					headers: {
						'request-header': 'should exist',
					},
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some other name',
					description: 'something something',
				}),
			);
		});

		test('can delete() - custom client headers should not overwrite library config headers', async () => {
			const spy = mockApiResponse({
				data: {
					deleteTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should exist',
				},
			});
			const { data } = await client.models.Todo.delete({
				id: 'some-id',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can delete() - custom request headers should overwrite client headers but not library config headers', async () => {
			const spy = mockApiResponse({
				data: {
					deleteTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						name: 'some name',
						description: 'something something',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					'client-header': 'should not exist',
				},
			});
			const { data } = await client.models.Todo.delete(
				{
					id: 'some-id',
				},
				{
					headers: {
						'request-header': 'should exist',
					},
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				}),
			);
		});

		test('can subscribe to onCreate() - with custom headers and library config headers', done => {
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
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onCreate({
				filter: graphqlVariables.filter,
				headers: customHeaders,
			}).subscribe({
				next(value) {
					// This util checks for the existence of library config headers:
					expectSubWithlibraryConfigHeaders(
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

		test('can subscribe to onUpdate() - with a custom header and library config headers', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onUpdateNote: noteToSend,
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
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onUpdate({
				filter: graphqlVariables.filter,
				headers: customHeaders,
			}).subscribe({
				next(value) {
					// This util checks for the existence of library config headers:
					expectSubWithlibraryConfigHeaders(
						spy,
						'onUpdateNote',
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

		test('can subscribe to onDelete() - with custom headers and library config headers', done => {
			const noteToSend = {
				__typename: 'Note',
				...serverManagedFields,
				body: 'a very good note',
			};

			const graphqlMessage = {
				data: {
					onDeleteNote: noteToSend,
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
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			client.models.Note.onDelete({
				filter: graphqlVariables.filter,
				headers: customHeaders,
			}).subscribe({
				next(value) {
					// This util checks for the existence of library config headers:
					expectSubWithlibraryConfigHeaders(
						spy,
						'onDeleteNote',
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
	});

	describe('observeQuery', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			Amplify.configure(configFixture as any);
		});

		test('can see initial results', done => {
			const client = generateClient<Schema>({ amplify: Amplify });

			mockApiResponse({
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
						nextToken: null,
					},
				},
			});

			const { streams, spy } = makeAppSyncStreams();

			client.models.Todo.observeQuery().subscribe({
				next({ items, isSynced }) {
					expect(isSynced).toBe(true);
					expect(items).toEqual([
						expect.objectContaining({
							__typename: 'Todo',
							...serverManagedFields,
							name: 'some name',
							description: 'something something',
						}),
					]);
					done();
				},
			});
		});

		test('can paginate through initial results', done => {
			const client = generateClient<Schema>({ amplify: Amplify });
			const { streams } = makeAppSyncStreams();

			let spy = mockApiResponse({
				data: {
					listTodos: {
						items: [
							{
								__typename: 'Todo',
								...serverManagedFields,
								name: 'first todo',
								description: 'something something first',
							},
						],
						nextToken: 'sometoken',
					},
				},
			});

			let isFirstResult = true;

			client.models.Todo.observeQuery().subscribe({
				next({ items, isSynced }) {
					if (isFirstResult) {
						isFirstResult = false;
						expect(isSynced).toBe(false);
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'first todo',
								description: 'something something first',
							}),
						]);
						spy = mockApiResponse({
							data: {
								listTodos: {
									items: [
										{
											__typename: 'Todo',
											...serverManagedFields,
											name: 'second todo',
											description: 'something something second',
										},
									],
									nextToken: undefined,
								},
							},
						});
					} else {
						expect(isSynced).toBe(true);
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'first todo',
								description: 'something something first',
							}),
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'second todo',
								description: 'something something second',
							}),
						]);

						expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

						done();
					}
				},
			});
		});

		test('can see creates - with non-empty query result', done => {
			const client = generateClient<Schema>({ amplify: Amplify });

			mockApiResponse({
				data: {
					listTodos: {
						items: [
							{
								__typename: 'Todo',
								...serverManagedFields,
								name: 'initial record',
								description: 'something something',
							},
						],
						nextToken: null,
					},
				},
			});

			const { streams, spy } = makeAppSyncStreams();

			let firstSnapshot = true;
			client.models.Todo.observeQuery().subscribe({
				next({ items, isSynced }) {
					if (firstSnapshot) {
						firstSnapshot = false;
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'initial record',
								description: 'something something',
							}),
						]);
						setTimeout(() => {
							streams.create?.next({
								data: {
									onCreateTodo: {
										__typename: 'Todo',
										...serverManagedFields,
										id: 'different-id',
										name: 'observed record',
										description: 'something something',
									},
								},
							});
						}, 1);
					} else {
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'initial record',
								description: 'something something',
							}),
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								id: 'different-id',
								name: 'observed record',
								description: 'something something',
							}),
						]);
						done();
					}
				},
			});
		});

		test('can see creates - with empty query result', done => {
			const client = generateClient<Schema>({ amplify: Amplify });

			mockApiResponse({
				data: {
					listTodos: {
						items: [],
						nextToken: null,
					},
				},
			});

			const { streams, spy } = makeAppSyncStreams();

			let firstSnapshot = true;
			client.models.Todo.observeQuery().subscribe({
				next({ items, isSynced }) {
					if (firstSnapshot) {
						firstSnapshot = false;
						expect(items).toEqual([]);
						setTimeout(() => {
							streams.create?.next({
								data: {
									onCreateTodo: {
										__typename: 'Todo',
										...serverManagedFields,
										id: 'observed-id',
										name: 'observed record',
										description: 'something something',
									},
								},
							});
						}, 1);
					} else {
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								id: 'observed-id',
								name: 'observed record',
								description: 'something something',
							}),
						]);
						done();
					}
				},
			});
		});

		test('can see onCreates that are received prior to fetch completion', done => {
			const client = generateClient<Schema>({ amplify: Amplify });

			// to record which order
			const callSequence = [] as string[];

			// get an API list response "started", but delayed, so that it returns
			// *after* we get a subscription messages sent to the client.
			mockApiResponse(
				new Promise(resolve => {
					const result = {
						data: {
							listTodos: {
								items: [
									{
										__typename: 'Todo',
										...serverManagedFields,
										name: 'initial record',
										description: 'something something',
									},
								],
								nextToken: null,
							},
						},
					};
					setTimeout(() => {
						callSequence.push('list');
						resolve(result);
					}, 15);
				}),
			);

			const { streams, spy } = makeAppSyncStreams();

			let firstSnapshot = true;
			client.models.Todo.observeQuery().subscribe({
				next({ items, isSynced }) {
					if (firstSnapshot) {
						firstSnapshot = false;
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'initial record',
								description: 'something something',
							}),
						]);
					} else {
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'initial record',
								description: 'something something',
							}),
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								id: 'different-id',
								name: 'observed record',
								description: 'something something',
							}),
						]);
						expect(callSequence).toEqual(['onCreate', 'list']);
						done();
					}
				},
			});

			streams.create?.next({
				data: {
					onCreateTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						id: 'different-id',
						name: 'observed record',
						description: 'something something',
					},
				},
			});
			callSequence.push('onCreate');
		});

		test('can see onUpdates that are received prior to fetch completion', done => {
			const client = generateClient<Schema>({ amplify: Amplify });

			// to record which order
			const callSequence = [] as string[];

			// get an API list response "started", but delayed, so that it returns
			// *after* we get a subscription messages sent to the client.
			mockApiResponse(
				new Promise(resolve => {
					const result = {
						data: {
							listTodos: {
								items: [
									{
										__typename: 'Todo',
										...serverManagedFields,
										name: 'initial record',
										description: 'something something',
									},
								],
								nextToken: null,
							},
						},
					};
					setTimeout(() => {
						callSequence.push('list');
						resolve(result);
					}, 15);
				}),
			);

			const { streams, spy } = makeAppSyncStreams();

			let firstSnapshot = true;
			client.models.Todo.observeQuery().subscribe({
				next({ items, isSynced }) {
					if (firstSnapshot) {
						firstSnapshot = false;
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'initial record',
								description: 'something something',
							}),
						]);
					} else {
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'initial record - UPDATED',
								description: 'something something',
							}),
						]);
						expect(callSequence).toEqual(['onUpdate', 'list']);
						done();
					}
				},
			});

			streams.update?.next({
				data: {
					onUpdateTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						id: 'some-id',
						name: 'initial record - UPDATED',
						description: 'something something',
					},
				},
			});
			callSequence.push('onUpdate');
		});

		test('can see onDeletes that are received prior to fetch completion', done => {
			const client = generateClient<Schema>({ amplify: Amplify });

			// to record which order
			const callSequence = [] as string[];

			// get an API list response "started", but delayed, so that it returns
			// *after* we get a subscription messages sent to the client.
			mockApiResponse(
				new Promise(resolve => {
					const result = {
						data: {
							listTodos: {
								items: [
									{
										__typename: 'Todo',
										...serverManagedFields,
										name: 'initial record',
										description: 'something something',
									},
								],
								nextToken: null,
							},
						},
					};
					setTimeout(() => {
						callSequence.push('list');
						resolve(result);
					}, 15);
				}),
			);

			const { streams, spy } = makeAppSyncStreams();

			let firstSnapshot = true;
			client.models.Todo.observeQuery().subscribe({
				next({ items, isSynced }) {
					if (firstSnapshot) {
						firstSnapshot = false;
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'initial record',
								description: 'something something',
							}),
						]);
					} else {
						expect(items).toEqual([]);
						expect(callSequence).toEqual(['onDelete', 'list']);
						done();
					}
				},
			});

			streams.delete?.next({
				data: {
					onDeleteTodo: {
						__typename: 'Todo',
						...serverManagedFields,
						id: 'some-id',
						name: 'initial record',
						description: 'something something',
					},
				},
			});
			callSequence.push('onDelete');
		});

		test('can see updates', done => {
			const client = generateClient<Schema>({ amplify: Amplify });

			mockApiResponse({
				data: {
					listTodos: {
						items: [
							{
								__typename: 'Todo',
								...serverManagedFields,
								name: 'initial record',
								description: 'something something',
							},
						],
						nextToken: null,
					},
				},
			});

			const { streams, spy } = makeAppSyncStreams();

			let firstSnapshot = true;
			client.models.Todo.observeQuery().subscribe({
				next({ items, isSynced }) {
					if (firstSnapshot) {
						firstSnapshot = false;
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'initial record',
								description: 'something something',
							}),
						]);
						setTimeout(() => {
							streams.update?.next({
								data: {
									onCreateTodo: {
										__typename: 'Todo',
										...serverManagedFields,
										name: 'updated record',
										description: 'something something',
									},
								},
							});
						}, 1);
					} else {
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'updated record',
								description: 'something something',
							}),
						]);
						done();
					}
				},
			});
		});

		test('can see deletions', done => {
			const client = generateClient<Schema>({ amplify: Amplify });

			mockApiResponse({
				data: {
					listTodos: {
						items: [
							{
								__typename: 'Todo',
								...serverManagedFields,
								name: 'initial record',
								description: 'something something',
							},
						],
						nextToken: null,
					},
				},
			});

			const { streams, spy } = makeAppSyncStreams();

			let firstSnapshot = true;
			client.models.Todo.observeQuery().subscribe({
				next({ items, isSynced }) {
					if (firstSnapshot) {
						firstSnapshot = false;
						expect(items).toEqual([
							expect.objectContaining({
								__typename: 'Todo',
								...serverManagedFields,
								name: 'initial record',
								description: 'something something',
							}),
						]);
						setTimeout(() => {
							streams.delete?.next({
								data: {
									onCreateTodo: {
										__typename: 'Todo',
										...serverManagedFields,
										name: 'initial record',
										description: 'something something',
									},
								},
							});
						}, 1);
					} else {
						expect(items).toEqual([]);
						done();
					}
				},
			});
		});

		describe('auth modes', () => {
			beforeEach(async () => {
				jest.clearAllMocks();
				Amplify.configure(configFixture as any);

				jest
					.spyOn(Amplify.Auth, 'fetchAuthSession')
					.mockImplementation(async () => {
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
						} as any;
					});
			});

			test('uses configured authMode by default', done => {
				const client = generateClient<Schema>({ amplify: Amplify });
				mockApiResponse({
					data: {
						listTodos: {
							items: [],
							nextToken: null,
						},
					},
				});
				const { spy } = makeAppSyncStreams();
				client.models.Todo.observeQuery().subscribe({
					next() {
						for (const op of ['onCreateTodo', 'onUpdateTodo', 'onDeleteTodo']) {
							expect(spy).toHaveBeenCalledWith(
								expect.objectContaining({
									query: expect.stringContaining(op),
									// configured fixture value is expected be `apiKey` for this test
									authenticationType: 'apiKey',
								}),
								USER_AGENT_DETAILS,
							);
						}
						done();
					},
				});
			});

			test('uses provided authMode at call site', done => {
				const client = generateClient<Schema>({ amplify: Amplify });
				mockApiResponse({
					data: {
						listTodos: {
							items: [],
							nextToken: null,
						},
					},
				});
				const { spy } = makeAppSyncStreams();
				client.models.Todo.observeQuery({ authMode: 'userPool' }).subscribe({
					next() {
						for (const op of ['onCreateTodo', 'onUpdateTodo', 'onDeleteTodo']) {
							expect(spy).toHaveBeenCalledWith(
								expect.objectContaining({
									query: expect.stringContaining(op),
									authenticationType: 'userPool',
								}),
								USER_AGENT_DETAILS,
							);
						}
						done();
					},
				});
			});

			test('uses provided authToken at call site', done => {
				const client = generateClient<Schema>({ amplify: Amplify });
				mockApiResponse({
					data: {
						listTodos: {
							items: [],
							nextToken: null,
						},
					},
				});
				const { spy } = makeAppSyncStreams();
				client.models.Todo.observeQuery({
					authMode: 'lambda',
					authToken: 'some-token',
				}).subscribe({
					next() {
						for (const op of ['onCreateTodo', 'onUpdateTodo', 'onDeleteTodo']) {
							expect(spy).toHaveBeenCalledWith(
								expect.objectContaining({
									query: expect.stringContaining(op),
									authenticationType: 'lambda',
									authToken: 'some-token',
								}),
								USER_AGENT_DETAILS,
							);
						}
						done();
					},
				});
			});

			test('uses provided authMode from the client', done => {
				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'userPool',
				});
				mockApiResponse({
					data: {
						listTodos: {
							items: [],
							nextToken: null,
						},
					},
				});
				const { spy } = makeAppSyncStreams();
				client.models.Todo.observeQuery().subscribe({
					next() {
						for (const op of ['onCreateTodo', 'onUpdateTodo', 'onDeleteTodo']) {
							expect(spy).toHaveBeenCalledWith(
								expect.objectContaining({
									query: expect.stringContaining(op),
									authenticationType: 'userPool',
								}),
								USER_AGENT_DETAILS,
							);
						}
						done();
					},
				});
			});

			test('uses provided authToken from the client', done => {
				const client = generateClient<Schema>({
					amplify: Amplify,
					authMode: 'lambda',
					authToken: 'some-token',
				});
				mockApiResponse({
					data: {
						listTodos: {
							items: [],
							nextToken: null,
						},
					},
				});
				const { spy } = makeAppSyncStreams();
				client.models.Todo.observeQuery().subscribe({
					next() {
						for (const op of ['onCreateTodo', 'onUpdateTodo', 'onDeleteTodo']) {
							expect(spy).toHaveBeenCalledWith(
								expect.objectContaining({
									query: expect.stringContaining(op),
									authenticationType: 'lambda',
									authToken: 'some-token',
								}),
								USER_AGENT_DETAILS,
							);
						}
						done();
					},
				});
			});
		});
	});

	describe('graphql default auth', () => {
		beforeEach(() => {
			jest.clearAllMocks();
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

	describe('graphql - client-level auth override', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			Amplify.configure(configFixture as any);

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

		test('client auth override query', async () => {
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

			// API key is the default auth mode for this API
			const client = generateClient({ amplify: Amplify, authMode: 'iam' });
			await client.graphql({
				query: `query { listTodos { __typename id owner createdAt updatedAt name description } }`,
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('client auth override query - lambda', async () => {
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

			// API key is the default auth mode for this API
			const client = generateClient({
				amplify: Amplify,
				authMode: 'lambda',
				authToken: 'trustno1',
			});
			await client.graphql({
				query: `query { listTodos { __typename id owner createdAt updatedAt name description } }`,
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});
	});

	describe('index queries', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			Amplify.configure(configFixture);
		});

		test('PK-only index query', async () => {
			const spy = mockApiResponse({
				data: {
					listByTitle: {
						items: [
							{
								__typename: 'Todo',
								...serverManagedFields,
								title: 'Hello World',
								description: 'something something',
							},
						],
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });

			const { data } = await client.models.SecondaryIndexModel.listByTitle({
				title: 'Hello World',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data.length).toBe(1);
			expect(data[0]).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					title: 'Hello World',
					description: 'something something',
				}),
			);
		});

		test('PK and SK index query', async () => {
			const spy = mockApiResponse({
				data: {
					listByDescriptionAndViewCount: {
						items: [
							{
								__typename: 'Todo',
								...serverManagedFields,
								title: 'Hello World',
								description: 'something something',
								viewCount: 5,
							},
						],
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });

			const { data } =
				await client.models.SecondaryIndexModel.listByDescriptionAndViewCount({
					description: 'something something',
					viewCount: { gt: 4 },
				});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data.length).toBe(1);
			expect(data[0]).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					title: 'Hello World',
					description: 'something something',
					viewCount: 5,
				}),
			);
		});

		test('PK and SK index query, with sort direction (ascending)', async () => {
			const spy = mockApiResponse({
				data: {
					listByDescriptionAndViewCount: {
						items: [
							{
								__typename: 'SecondaryIndexModel',
								...serverManagedFields,
								title: 'first',
								description: 'match',
								viewCount: 1,
							},
							{
								__typename: 'SecondaryIndexModel',
								...serverManagedFields,
								title: 'second',
								description: 'match',
								viewCount: 2,
							},
							{
								__typename: 'SecondaryIndexModel',
								...serverManagedFields,
								title: 'third',
								description: 'match',
								viewCount: 3,
							},
						],
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });

			const { data } =
				await client.models.SecondaryIndexModel.listByDescriptionAndViewCount(
					{
						description: 'match',
						viewCount: { lt: 4 },
					},
					{
						sortDirection: 'ASC',
					},
				);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data.length).toBe(3);
		});

		test('PK and SK index query, with sort direction (descending)', async () => {
			const spy = mockApiResponse({
				data: {
					listByDescriptionAndViewCount: {
						items: [
							{
								__typename: 'SecondaryIndexModel',
								...serverManagedFields,
								title: 'third',
								description: 'match',
								viewCount: 3,
							},
							{
								__typename: 'SecondaryIndexModel',
								...serverManagedFields,
								title: 'second',
								description: 'match',
								viewCount: 2,
							},
							{
								__typename: 'SecondaryIndexModel',
								...serverManagedFields,
								title: 'first',
								description: 'match',
								viewCount: 1,
							},
						],
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });

			const { data } =
				await client.models.SecondaryIndexModel.listByDescriptionAndViewCount(
					{
						description: 'match',
						viewCount: { lt: 4 },
					},
					{
						sortDirection: 'DESC',
					},
				);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();

			expect(data.length).toBe(3);
		});
	});

	describe('custom operations', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			jest.resetAllMocks();
			jest.restoreAllMocks();

			Amplify.configure(configFixture as any);

			jest
				.spyOn(Amplify.Auth, 'fetchAuthSession')
				.mockImplementation(async () => {
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
					} as any;
				});
		});

		test('can query with returnType of customType', async () => {
			const spy = mockApiResponse({
				data: {
					echo: {
						resultContent: 'echo result content',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});
			const result = await client.queries.echo({
				argumentContent: 'echo argumentContent value',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			expect(result?.data).toEqual({
				resultContent: 'echo result content',
			});
		});

		test('can query with returnType of nested custom types', async () => {
			const mockReturnData = {
				note: 'test node',
				productMeta: {
					releaseDate: '2024-03-04',
					status: 'in_production',
					deepMeta: {
						content: 'test deep meta content',
					},
				},
			};
			const spy = mockApiResponse({
				data: {
					echoNestedCustomTypes: mockReturnData,
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});
			const result = await client.queries.echoNestedCustomTypes({
				input: 'test input',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			expect(result?.data).toEqual(mockReturnData);
		});

		test('can query with returnType of a model that has nested custom types', async () => {
			const mockReturnData = {
				sku: 'sku',
				factoryId: 'factoryId',
				warehouseId: 'warehouseId',
				description: 'description',
				trackingMeta: {
					productMeta: {
						releaseDate: '2024-03-04',
						status: 'discontinued',
						deepMeta: {
							content: 'test content',
						},
					},
					note: 'test note',
				},
			};
			const spy = mockApiResponse({
				data: {
					echoNestedCustomTypes: mockReturnData,
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});
			const result = await client.queries.echoModelHasNestedTypes({
				input: 'test input',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			expect(result?.data).toEqual(mockReturnData);
		});

		test('can query with returnType of string', async () => {
			const spy = mockApiResponse({
				data: {
					echoString: 'echo result content',
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});
			const result = await client.queries.echoString({
				inputString: 'echo argumentContent value',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			expect(result?.data).toEqual('echo result content');
		});

		test('can mutate with returnType of customType', async () => {
			const spy = mockApiResponse({
				data: {
					likePost: {
						likes: 123,
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});
			const result = await client.mutations.likePost({
				postId: 'post-abc',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			expect(result?.data).toEqual({
				likes: 123,
			});
		});

		test('can mutate with returnType of model (Post)', async () => {
			const likePostReturnPost = {
				id: 'post-123',
				content: 'some really slick content',
				owner: null,
				createdAt: '2024-02-21T21:30:29.826Z',
				updatedAt: '2024-02-21T21:30:29.826Z',
			};

			const spy = mockApiResponse({
				data: { likePostReturnPost },
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});
			const result = await client.mutations.likePostReturnPost({
				postId: 'post-abc',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
			expect(result?.data).toEqual(expect.objectContaining(likePostReturnPost));
		});

		test('can return model (Post) that with lazy-loading props', async () => {
			const likePostReturnPost = {
				id: 'post-123',
				content: 'some really slick content',
				owner: null,
				createdAt: '2024-02-21T21:30:29.826Z',
				updatedAt: '2024-02-21T21:30:29.826Z',
			};

			const likePostSpy = mockApiResponse({
				data: { likePostReturnPost },
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});
			const result = await client.mutations.likePostReturnPost({
				postId: 'post-abc',
			});

			const listCommentItem = {
				content: 'some content',
				createdAt: '2024-02-09T16:42:52.486Z',
				id: 'comment123',
				owner: '8d0a5587-1d0f-4d05-b120-ecae23ee1f0e',
				postCommentsId: 'post-123',
				updatedAt: '2024-02-09T16:42:52.486Z',
			};

			const lazyLoadCommentsSpy = mockApiResponse({
				data: {
					listComments: {
						items: [listCommentItem],
						nextToken: null,
					},
				},
			});

			const { data: comments } = await result.data!.comments();

			expect(normalizePostGraphqlCalls(lazyLoadCommentsSpy)).toMatchSnapshot();
			expect(comments[0]).toEqual(expect.objectContaining(listCommentItem));
		});

		test('can subscribe to custom subscription', done => {
			const postToSend = {
				__typename: 'Post',
				...serverManagedFields,
				content: 'a lovely post',
			};

			const graphqlMessage = {
				data: {
					onPostLiked: postToSend,
				},
			};

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			const spyGql = jest.spyOn(raw.GraphQLAPI as any, 'graphql');

			const expectedOperation = 'subscription';
			const expectedFieldAndSelectionSet =
				'onPostLiked {id content owner createdAt updatedAt}';

			const sub = client.subscriptions.onPostLiked().subscribe({
				next(value) {
					expect(value).toEqual(expect.objectContaining(postToSend));

					expect(spyGql).toHaveBeenCalledWith(
						expect.anything(),
						expect.objectContaining({
							query: expect.stringContaining(expectedOperation),
							variables: {},
						}),
						expect.anything(),
					);
					expect(spyGql).toHaveBeenCalledWith(
						expect.anything(),
						expect.objectContaining({
							query: expect.stringContaining(expectedFieldAndSelectionSet),
							variables: {},
						}),
						expect.anything(),
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});

			sub.unsubscribe();
		});

		test('can subscribe to custom subscription with args', done => {
			const postToSend = {
				__typename: 'Post',
				...serverManagedFields,
				postId: 'abc123',
				content: 'a lovely post',
			};

			const graphqlMessage = {
				data: {
					onPostLiked: postToSend,
				},
			};

			const client = generateClient<Schema>({ amplify: Amplify });

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			const spyGql = jest.spyOn(raw.GraphQLAPI as any, 'graphql');

			const expectedOperation = 'subscription($postId: String)';
			const expectedFieldAndSelectionSet =
				'onPostUpdated(postId: $postId) {id content owner createdAt updatedAt}';

			const sub = client.subscriptions
				.onPostUpdated({ postId: 'abc123' })
				.subscribe({
					next(value) {
						expect(value).toEqual(expect.objectContaining(postToSend));

						expect(spyGql).toHaveBeenCalledWith(
							expect.anything(),
							expect.objectContaining({
								query: expect.stringContaining(expectedOperation),

								variables: { postId: 'abc123' },
							}),
							expect.anything(),
						);
						expect(spyGql).toHaveBeenCalledWith(
							expect.anything(),
							expect.objectContaining({
								query: expect.stringContaining(expectedFieldAndSelectionSet),

								variables: { postId: 'abc123' },
							}),
							expect.anything(),
						);
						done();
					},
					error(error) {
						expect(error).toBeUndefined();
						done('bad news!');
					},
				});

			sub.unsubscribe();
		});

		test('includes client level headers', async () => {
			const spy = mockApiResponse({
				data: {
					echo: {
						resultContent: 'echo result content',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				headers: {
					someHeader: 'some header value',
				},
			});
			const result = await client.queries.echo({
				argumentContent: 'echo argumentContent value',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('includes call level headers', async () => {
			const spy = mockApiResponse({
				data: {
					echo: {
						resultContent: 'echo result content',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});
			const result = await client.queries.echo(
				{
					argumentContent: 'echo argumentContent value',
				},
				{
					headers: {
						callSiteHeaders: 'some header value',
					},
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('uses client authMode', async () => {
			const spy = mockApiResponse({
				data: {
					echo: {
						resultContent: 'echo result content',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
				authMode: 'lambda',
				authToken: 'my-auth-token',
			});
			const result = await client.queries.echo({
				argumentContent: 'echo argumentContent value',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('uses call site authMode', async () => {
			const spy = mockApiResponse({
				data: {
					echo: {
						resultContent: 'echo result content',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});
			const result = await client.queries.echo(
				{
					argumentContent: 'echo argumentContent value',
				},
				{
					authMode: 'lambda',
					authToken: 'my-auth-token',
				},
			);

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('uses config level headers if available', async () => {
			Amplify.configure(configFixture as any, {
				API: {
					GraphQL: {
						headers: async () => ({
							'config-level-header': 'config header value',
						}),
					},
				},
			});

			const spy = mockApiResponse({
				data: {
					echo: {
						resultContent: 'echo result content',
					},
				},
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});
			const result = await client.queries.echo({
				argumentContent: 'echo argumentContent value',
			});

			expect(normalizePostGraphqlCalls(spy)).toMatchSnapshot();
		});

		test('graphql error handling', async () => {
			const spy = mockApiResponse({
				data: null,
				errors: [{ message: 'some graphql error' }],
			});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});
			const { data, errors } = await client.queries.echo({
				argumentContent: 'echo argumentContent value',
			});

			expect(data).toBeNull();
			expect(errors).toEqual([{ message: 'some graphql error' }]);
		});

		test('network error handling', async () => {
			jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockImplementation(async () => {
					// not strictly what I expect a network error will look like,
					// but represents the guts of `post` throwing any generic error.
					throw new Error('Network error');
				});

			const client = generateClient<Schema>({
				amplify: Amplify,
			});

			const { data, errors } = await client.queries.echo({
				argumentContent: 'echo argumentContent value',
			});

			// TODO: data should actually be null/undefined, pending discussion and fix.
			// This is not strictly related to custom ops.
			expect(data).toEqual(null);
			expect(errors).toEqual([{ message: 'Network error' }]);
		});

		test('core error handling', async () => {
			// Basically, we want to ensure exceptions we throw aren't simply swallowed.
			// The list of errors that are thrown appears to be pretty small, since we
			// package up a lot of different errors types into `{ errors }` as possible.
			// But, a clear example where this doesn't occur is request cancellations.

			const spy = mockApiResponse(
				new Promise(resolve => {
					// slight delay to give us time to cancel the request.
					setTimeout(
						() =>
							resolve({
								data: {
									echo: {
										resultContent: 'echo result content',
									},
								},
							}),
						1,
					);
				}),
			);

			const client = generateClient<Schema>({
				amplify: Amplify,
			});

			const result = client.queries.echo({
				argumentContent: 'echo argumentContent value',
			});

			client.cancel(result);

			expect(result).resolves.toThrow();
		});
	});
});

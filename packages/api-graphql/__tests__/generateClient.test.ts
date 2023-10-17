import * as raw from '../src';
import { Amplify, AmplifyClassV6 } from '@aws-amplify/core';
import { generateClient } from '../src/internals';
import configFixture from './fixtures/modeled/amplifyconfiguration';
import { Schema } from './fixtures/modeled/schema';

const serverManagedFields = {
	id: 'some-id',
	owner: 'wirejobviously',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

function mockApiResponse(value: any) {
	return jest.spyOn((raw.GraphQLAPI as any)._api, 'post').mockReturnValue({
		body: {
			json: () => value,
		},
	});
}

describe('generateClient', () => {
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

	describe('with model', () => {
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

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'some-api-key',
						}),
						body: {
							query: expect.stringContaining('createTodo(input: $input)'),
							variables: {
								input: {
									name: 'some name',
									description: 'something something',
								},
							},
						},
					}),
				})
			);

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				})
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
					},
				},
			});

			const client = generateClient<Schema>({ amplify: Amplify });
			const { data } = await client.models.Todo.get({ id: 'asdf' });

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'some-api-key',
						}),
						body: {
							query: expect.stringContaining('getTodo(id: $id)'),
							variables: {
								id: 'asdf',
							},
						},
					}),
				})
			);

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				})
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

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'some-api-key',
						}),
						body: {
							query: expect.stringContaining('listTodos(filter: $filter)'),
							variables: {
								filter: {
									name: {
										contains: 'name',
									},
								},
							},
						},
					}),
				})
			);

			expect(data.length).toBe(1);
			expect(data[0]).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				})
			);
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

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'some-api-key',
						}),
						body: {
							query: expect.stringContaining('updateTodo(input: $input)'),
							variables: {
								input: {
									id: 'some-id',
									name: 'some other name',
								},
							},
						},
					}),
				})
			);

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some other name',
					description: 'something something',
				})
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

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'some-api-key',
						}),
						body: {
							query: expect.stringContaining('deleteTodo(input: $input)'),
							variables: {
								input: {
									id: 'some-id',
								},
							},
						},
					}),
				})
			);

			expect(data).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'some-id',
					owner: 'wirejobviously',
					name: 'some name',
					description: 'something something',
				})
			);
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

			const { data: notes } = await data.notes();

			expect(getChildNotesSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'some-api-key',
						}),
						body: {
							query: expect.stringContaining('listNotes(filter: $filter)'),
							variables: {
								filter: {
									and: [{ todoNotesId: { eq: 'todo-id' } }],
								},
							},
						},
					}),
				})
			);

			expect(notes!.length).toBe(1);
			expect(notes![0]).toEqual(
				expect.objectContaining({
					__typename: 'Note',
					id: 'note-id',
					owner: 'wirejobviously',
					body: 'some body',
				})
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

			const { data: todo } = await data.todo();

			expect(getChildNotesSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'some-api-key',
						}),
						body: {
							query: expect.stringContaining('getTodo(id: $id)'),
							variables: {
								id: 'todo-id',
							},
						},
					}),
				})
			);

			expect(todo).toEqual(
				expect.objectContaining({
					__typename: 'Todo',
					id: 'todo-id',
					name: 'some name',
					description: 'something something',
				})
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

			const { data: todo } = await data.meta();

			expect(getChildMetaSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'some-api-key',
						}),
						body: {
							query: expect.stringContaining('getTodoMetadata(id: $id)'),
							variables: {
								id: 'meta-id',
							},
						},
					}),
				})
			);

			expect(todo).toEqual(
				expect.objectContaining({
					__typename: 'TodoMetadata',
					id: 'meta-id',
					data: '{"field":"value"}',
				})
			);
		});
	});
});

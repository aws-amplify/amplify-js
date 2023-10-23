import * as raw from '../src';
import { Amplify, AmplifyClassV6 } from '@aws-amplify/core';
import { generateClient } from '../src/internals';
import configFixture from './fixtures/modeled/amplifyconfiguration';
import { Schema } from './fixtures/modeled/schema';
import { expectSub } from './utils/expects';
import { Observable, from } from 'rxjs';

const serverManagedFields = {
	id: 'some-id',
	owner: 'wirejobviously',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

/**
 *
 * @param value Value to be returned. Will be `awaited`, and can
 * therefore be a simple JSON value or a `Promise`.
 * @returns
 */
function mockApiResponse(value: any) {
	return jest
		.spyOn((raw.GraphQLAPI as any)._api, 'post')
		.mockImplementation(async () => {
			const result = await value;
			return {
				body: {
					json: () => result,
				},
			};
		});
}

function makeAppSyncStreams() {
	const streams = {} as Partial<
		Record<
			'create' | 'update' | 'delete',
			{
				next: (message: any) => void;
			}
		>
	>;
	const spy = jest.fn(request => {
		const matchedType = (request.query as string).match(
			/on(Create|Update|Delete)/
		);
		if (matchedType) {
			return new Observable(subscriber => {
				streams[matchedType[1].toLowerCase()] = subscriber;
			});
		}
	});
	(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };
	return { streams, spy };
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

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'FAKE-KEY',
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
							'X-Api-Key': 'FAKE-KEY',
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
							'X-Api-Key': 'FAKE-KEY',
						}),
						body: {
							query: expect.stringContaining(
								'listTodos(filter: $filter, limit: $limit, nextToken: $nextToken)'
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
				})
			);

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						body: expect.objectContaining({
							query: expect.stringContaining('nextToken'),
						}),
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
							'X-Api-Key': 'FAKE-KEY',
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
							'X-Api-Key': 'FAKE-KEY',
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
					expect(value).toEqual(noteToSend);
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
					expect(value).toEqual(noteToSend);
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
					expect(value).toEqual(noteToSend);
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

			const { data: notes } = await data.notes();

			expect(getChildNotesSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						headers: expect.objectContaining({
							'X-Api-Key': 'FAKE-KEY',
						}),
						body: {
							query: expect.stringContaining(
								'listNotes(filter: $filter, limit: $limit, nextToken: $nextToken)'
							),
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
							'X-Api-Key': 'FAKE-KEY',
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
							'X-Api-Key': 'FAKE-KEY',
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

						// ensure we actually got a request that included our next token
						expect(spy).toHaveBeenCalledWith(
							expect.objectContaining({
								options: expect.objectContaining({
									body: expect.objectContaining({
										variables: expect.objectContaining({
											nextToken: 'sometoken',
										}),
									}),
								}),
							})
						);

						done();
					}
				},
			});
		});

		test('can see creates - with non-empty query result', async done => {
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

		test('can see creates - with empty query result', async done => {
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

		// MOSTLY COPY PASTED ... NOT IMPLEMENTED YET
		test('can see onCreates that are received prior to fetch completion', async done => {
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
				})
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

		test('can see updates', async done => {
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

		test('can see deletions', async done => {
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
	});
});

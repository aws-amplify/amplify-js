import * as raw from '../src';
import { graphql } from '../src/internals/v6';
import { Amplify } from 'aws-amplify';
import * as typedQueries from './fixtures/with-types/queries';
import * as typedMutations from './fixtures/with-types/mutations';
import * as typedSubscriptions from './fixtures/with-types/subscriptions';
import * as untypedQueries from './fixtures/without-types/queries';
import * as untypedMutations from './fixtures/without-types/mutations';
import * as untypedSubscriptions from './fixtures/without-types/subscriptions';
import { from } from 'rxjs';
import {
	expectGet,
	expectList,
	expectMutation,
	expectSub,
} from './utils/expects';

import {
	GraphQLResult,
	GraphqlSubscriptionResult,
	GraphqlSubscriptionMessage,
	GraphQLQuery,
	GraphQLSubscription,
	DeeplyPartial,
} from '../src/types';

import {
	CreateThreadMutation,
	UpdateThreadMutation,
	DeleteThreadMutation,
	GetThreadQuery,
	ListThreadsQuery,
	OnCreateThreadSubscription,
	Thread,
	Comment,
} from './fixtures/with-types/API';

const serverManagedFields = {
	id: 'some-id',
	owner: 'wirejobviously',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

describe('client', () => {
	// `generateClient()` is only exported from top-level API category.
	const client = { graphql };

	beforeEach(() => {
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
	});

	afterEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
	});

	describe('type-tagged graphql', () => {
		test('create', async () => {
			const threadToCreate = { topic: 'a very engaging discussion topic' };

			const graphqlResponse = {
				data: {
					createThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToCreate,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockImplementation(() => ({
					body: {
						json: () => graphqlResponse,
					},
				}));

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<CreateThreadMutation> = await client.graphql({
				query: typedMutations.createThread,
				authMode: 'apiKey',
				variables: {
					input: threadToCreate,
				},
			});

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const thread: CreateThreadMutation['createThread'] =
				result.data?.createThread;
			const errors = result.errors;

			expectMutation(spy, 'createThread', threadToCreate);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.createThread);
		});

		test('update', async () => {
			const threadToUpdate = {
				id: 'abc',
				topic: 'a new (but still very stimulating) topic',
			};

			const graphqlResponse = {
				data: {
					updateThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToUpdate,
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

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<UpdateThreadMutation> = await client.graphql({
				query: typedMutations.updateThread,
				variables: {
					input: threadToUpdate,
				},
				authMode: 'apiKey',
			});

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const thread: UpdateThreadMutation['updateThread'] =
				result.data?.updateThread;
			const errors = result.errors;

			expectMutation(spy, 'updateThread', threadToUpdate);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.updateThread);
		});

		test('delete', async () => {
			const threadToDelete = { id: 'abc' };

			const graphqlResponse = {
				data: {
					deleteThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToDelete,
						topic: 'not a very interesting topic (hence the deletion)',
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

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<DeleteThreadMutation> = await client.graphql({
				query: typedMutations.deleteThread,
				variables: {
					input: threadToDelete,
				},
				authMode: 'apiKey',
			});

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const thread: DeleteThreadMutation['deleteThread'] =
				result.data?.deleteThread;
			const errors = result.errors;

			expectMutation(spy, 'deleteThread', threadToDelete);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.deleteThread);
		});

		test('get', async () => {
			const threadToGet = {
				id: 'some-thread-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-thread-id' };

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

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'apiKey',
			});

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const thread: GetThreadQuery['getThread'] = result.data?.getThread;
			const errors = result.errors;

			expectGet(spy, 'getThread', graphqlVariables);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
		});

		test('list', async () => {
			const threadsToList = [
				{
					__typename: 'Thread',
					...serverManagedFields,
					topic: 'really cool stuff',
				},
			];

			const graphqlVariables = {
				filter: {
					topic: { contains: 'really cool stuff' },
				},
				nextToken: null,
			};

			const graphqlResponse = {
				data: {
					listThreads: {
						items: threadsToList,
						nextToken: null,
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

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<ListThreadsQuery> = await client.graphql({
				query: typedQueries.listThreads,
				variables: graphqlVariables,
				authMode: 'apiKey',
			});

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const listThreads: ListThreadsQuery['listThreads'] =
				result.data?.listThreads;
			const { items, nextToken } = listThreads || {};
			const errors = result.errors;

			expectList(spy, 'listThreads', graphqlVariables);
			expect(errors).toBe(undefined);
			expect(items).toEqual(graphqlResponse.data.listThreads.items);
		});

		test('subscribe', done => {
			const threadToSend = {
				__typename: 'Thread',
				...serverManagedFields,
				topic: 'really cool stuff',
			};

			const graphqlMessage = {
				data: {
					onCreateThread: threadToSend,
				},
			};

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			const graphqlVariables = {
				filter: {
					topic: { contains: 'really cool stuff' },
				},
			};

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphqlSubscriptionResult<OnCreateThreadSubscription> =
				client.graphql({
					query: typedSubscriptions.onCreateThread,
					variables: graphqlVariables,
					authMode: 'apiKey',
				});

			result.subscribe({
				// Customers should normally omit the type. Making it explicit to ensure the test
				// fails if the returned changes.
				next(message: GraphqlSubscriptionMessage<OnCreateThreadSubscription>) {
					expectSub(spy, 'onCreateThread', graphqlVariables);
					expect(message.data?.onCreateThread).toEqual(
						graphqlMessage.data.onCreateThread
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

	describe('type-tagged graphql with util type adapter', () => {
		test('create', async () => {
			const threadToCreate = { topic: 'a very engaging discussion topic' };

			const graphqlResponse = {
				data: {
					createThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToCreate,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockImplementation(() => graphqlResponse);

			// If the update fails, we get an error which we'll need to catch.
			// If it succeeds, we get a result back and no need to look for `null | undefined`
			const thread: DeeplyPartial<Thread> = (
				await client.graphql({
					query: typedMutations.createThread,
					authMode: 'apiKey',
					variables: {
						input: threadToCreate,
					},
				})
			).data.createThread;
		});

		test('update', async () => {
			const threadToUpdate = {
				id: 'abc',
				topic: 'a new (but still very stimulating) topic',
			};

			const graphqlResponse = {
				data: {
					updateThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToUpdate,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockImplementation(() => graphqlResponse);

			// Not sure yet what happens if an update failes to find a matching record ... pretty sure
			// it's an error though! This would indicate update queries can omit
			const thread: DeeplyPartial<Thread> = (
				await client.graphql({
					query: typedMutations.updateThread,
					variables: {
						input: threadToUpdate,
					},
					authMode: 'apiKey',
				})
			).data.updateThread;
		});

		test('delete', async () => {
			const threadToDelete = { id: 'abc' };

			const graphqlResponse = {
				data: {
					deleteThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToDelete,
						topic: 'not a very interesting topic (hence the deletion)',
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockImplementation(() => graphqlResponse);

			// If a delete fails, an error is raised. So, we don't need to handle null or
			// undefined return values in the happy path.
			const thread: DeeplyPartial<Thread> = (
				await client.graphql({
					query: typedMutations.deleteThread,
					variables: {
						input: threadToDelete,
					},
					authMode: 'apiKey',
				})
			).data.deleteThread;
		});

		test('get', async () => {
			const threadToGet = {
				id: 'some-thread-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-thread-id' };

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
				.mockImplementation(() => graphqlResponse);

			// a get query might not actually find anything.
			const thread: DeeplyPartial<Thread> | null | undefined = (
				await client.graphql({
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'apiKey',
				})
			).data.getThread;

			// we SHOULD get a type error if we blindly try to assign a get result
			// to a type that doesn't account for `null | undefined` returns.
			// TODO: change to ts-expect-error
			// @ts-ignore
			const badthread: DeeplyPartial<Thread> = (
				await client.graphql({
					query: typedQueries.getThread,
					variables: graphqlVariables,
					authMode: 'apiKey',
				})
			).data.getThread;
		});

		test('list', async () => {
			const threadsToList = [
				{
					__typename: 'Thread',
					...serverManagedFields,
					topic: 'really cool stuff',
				},
			];

			const graphqlVariables = {
				filter: {
					topic: { contains: 'really cool stuff' },
				},
				nextToken: null,
			};

			const graphqlResponse = {
				data: {
					listThreads: {
						items: threadsToList,
						nextToken: null,
					},
				},
			};

			const spy = jest
				.spyOn((raw.GraphQLAPI as any)._api, 'post')
				.mockImplementation(() => graphqlResponse);

			const threads: DeeplyPartial<Thread>[] = (
				await client.graphql({
					query: typedQueries.listThreads,
					variables: graphqlVariables,
					authMode: 'apiKey',
				})
			).data.listThreads.items;
		});

		test('subscribe', done => {
			const threadToSend = {
				__typename: 'Thread',
				...serverManagedFields,
				topic: 'really cool stuff',
			};

			const graphqlMessage = {
				data: {
					onCreateThread: threadToSend,
				},
			};

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			const graphqlVariables = {
				filter: {
					topic: { contains: 'really cool stuff' },
				},
			};

			const result = client.graphql({
				query: typedSubscriptions.onCreateThread,
				variables: graphqlVariables,
				authMode: 'apiKey',
			});

			const threads: DeeplyPartial<Thread>[] = [];
			// const threads: Thread[] = [];

			result.subscribe({
				next(message) {
					threads.push(message.data.onCreateThread);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			});
		});
	});

	describe('un-tagged graphql, with as any casts', () => {
		test('create', async () => {
			const threadToCreate = { topic: 'a very engaging discussion topic' };

			const graphqlResponse = {
				data: {
					createThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToCreate,
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

			// Customers would not specify these types. They're shown to demonstrate
			// the return type for the test.
			const rawResult:
				| raw.GraphqlSubscriptionResult<any>
				| raw.GraphQLResult<any> = await client.graphql({
				query: untypedMutations.createThread,
				authMode: 'apiKey',
				variables: {
					input: threadToCreate,
				},
			});

			// An `as any` is what customers would likely write without branded queries.
			const result = rawResult as any;

			const thread = result.data?.createThread;
			const errors = result.errors;

			expectMutation(spy, 'createThread', threadToCreate);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.createThread);
		});

		test('update', async () => {
			const threadToUpdate = {
				id: 'abc',
				topic: 'a new (but still very stimulating) topic',
			};

			const graphqlResponse = {
				data: {
					updateThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToUpdate,
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

			// Customers would not specify these types. They're shown to demonstrate
			// the return type for the test.
			const rawResult:
				| raw.GraphqlSubscriptionResult<any>
				| raw.GraphQLResult<any> = await client.graphql({
				query: untypedMutations.updateThread,
				variables: {
					input: threadToUpdate,
				},
				authMode: 'apiKey',
			});

			// An `as any` is what customers would likely write without branded queries.
			const result = rawResult as any;

			const thread = result.data?.updateThread;
			const errors = result.errors;

			expectMutation(spy, 'updateThread', threadToUpdate);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.updateThread);
		});

		test('delete', async () => {
			const threadToDelete = { id: 'abc' };

			const graphqlResponse = {
				data: {
					deleteThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToDelete,
						topic: 'not a very interesting topic (hence the deletion)',
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

			// Customers would not specify these types. They're shown to demonstrate
			// the return type for the test.
			const rawResult:
				| raw.GraphqlSubscriptionResult<any>
				| raw.GraphQLResult<any> = await client.graphql({
				query: untypedMutations.deleteThread,
				variables: {
					input: threadToDelete,
				},
				authMode: 'apiKey',
			});

			// An `as any` is what customers would likely write without branded queries.
			const result = rawResult as any;

			const thread = result.data?.deleteThread;
			const errors = result.errors;

			expectMutation(spy, 'deleteThread', threadToDelete);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.deleteThread);
		});

		test('get', async () => {
			const threadToGet = {
				id: 'some-thread-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-thread-id' };

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

			// Customers would not specify these types. They're shown to demonstrate
			// the return type for the test.
			const rawResult:
				| raw.GraphqlSubscriptionResult<any>
				| raw.GraphQLResult<any> = await client.graphql({
				query: untypedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'apiKey',
			});

			// An `as any` is what customers would likely write without branded queries.
			const result = rawResult as any;

			const thread = result.data?.getThread;
			const errors = result.errors;

			expectGet(spy, 'getThread', graphqlVariables);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
		});

		test('list', async () => {
			const threadsToList = [
				{
					__typename: 'Thread',
					...serverManagedFields,
					topic: 'really cool stuff',
				},
			];

			const graphqlVariables = {
				filter: {
					topic: { contains: 'really cool stuff' },
				},
				nextToken: null,
			};

			const graphqlResponse = {
				data: {
					listThreads: {
						items: threadsToList,
						nextToken: null,
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

			// Customers would not specify these types. They're shown to demonstrate
			// the return type for the test.
			const rawResult:
				| raw.GraphqlSubscriptionResult<any>
				| raw.GraphQLResult<any> = await client.graphql({
				query: untypedQueries.listThreads,
				variables: graphqlVariables,
				authMode: 'apiKey',
			});

			// An `as any` is what customers would likely write without branded queries.
			const result = rawResult as any;

			const { items, nextToken } = result.data?.listThreads || {};
			const errors = result.errors;

			expectList(spy, 'listThreads', graphqlVariables);
			expect(errors).toBe(undefined);
			expect(items).toEqual(graphqlResponse.data.listThreads.items);
		});

		test('subscribe', done => {
			const threadToSend = {
				__typename: 'Thread',
				...serverManagedFields,
				topic: 'really cool stuff',
			};

			const graphqlMessage = {
				data: {
					onCreateThread: threadToSend,
				},
			};

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			const graphqlVariables = {
				filter: {
					topic: { contains: 'really cool stuff' },
				},
			};

			// Customers would not specify these types. They're shown to demonstrate
			// the return type for the test.
			const rawResult:
				| raw.GraphqlSubscriptionResult<any>
				| Promise<raw.GraphQLResult<any>> = client.graphql({
				query: untypedSubscriptions.onCreateThread,
				variables: graphqlVariables,
				authMode: 'apiKey',
			});

			// An `as any` is what customers would likely write without branded queries.
			const result = rawResult as any;

			result.subscribe?.({
				next(message: any) {
					expectSub(spy, 'onCreateThread', graphqlVariables);
					expect(message.data.onCreateThread).toEqual(
						graphqlMessage.data.onCreateThread
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			})!;
		});
	});

	describe('un-tagged graphql, with type args', () => {
		test('create', async () => {
			const threadToCreate = { topic: 'a very engaging discussion topic' };

			const graphqlResponse = {
				data: {
					createThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToCreate,
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

			// Customers would not likely annotate the types in both places. They are provided
			// in both places to trigger type errors if the right-hand side changes.
			const result: GraphQLResult<CreateThreadMutation> = await client.graphql<
				GraphQLQuery<CreateThreadMutation>
			>({
				query: untypedMutations.createThread,
				authMode: 'apiKey',
				variables: {
					input: threadToCreate,
				},
			});

			const thread = result.data?.createThread;
			const errors = result.errors;

			expectMutation(spy, 'createThread', threadToCreate);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.createThread);
		});

		test('update', async () => {
			const threadToUpdate = {
				id: 'abc',
				topic: 'a new (but still very stimulating) topic',
			};

			const graphqlResponse = {
				data: {
					updateThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToUpdate,
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

			// Customers would not likely annotate the types in both places. They are provided
			// in both places to trigger type errors if the right-hand side changes.
			const result: GraphQLResult<UpdateThreadMutation> = await client.graphql<
				GraphQLQuery<UpdateThreadMutation>
			>({
				query: untypedMutations.updateThread,
				variables: {
					input: threadToUpdate,
				},
				authMode: 'apiKey',
			});

			const thread = result.data?.updateThread;
			const errors = result.errors;

			expectMutation(spy, 'updateThread', threadToUpdate);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.updateThread);
		});

		test('delete', async () => {
			const threadToDelete = { id: 'abc' };
			const graphqlResponse = {
				data: {
					deleteThread: {
						__typename: 'Thread',
						...serverManagedFields,
						...threadToDelete,
						topic: 'not a very interesting topic (hence the deletion)',
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

			// Customers would not likely annotate the types in both places. They are provided
			// in both places to trigger type errors if the right-hand side changes.
			const result: GraphQLResult<DeleteThreadMutation> = await client.graphql<
				GraphQLQuery<DeleteThreadMutation>
			>({
				query: untypedMutations.deleteThread,
				variables: {
					input: threadToDelete,
				},
				authMode: 'apiKey',
			});

			const thread = result.data?.deleteThread;
			const errors = result.errors;

			expectMutation(spy, 'deleteThread', threadToDelete);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.deleteThread);
		});

		test('get', async () => {
			const threadToGet = {
				id: 'some-thread-id',
				topic: 'something reasonably interesting',
			};

			const graphqlVariables = { id: 'some-thread-id' };

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

			// Customers would not likely annotate the types in both places. They are provided
			// in both places to trigger type errors if the right-hand side changes.
			const result: GraphQLResult<GetThreadQuery> = await client.graphql<
				GraphQLQuery<GetThreadQuery>
			>({
				query: untypedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'apiKey',
			});

			const thread = result.data?.getThread;
			const errors = result.errors;

			expectGet(spy, 'getThread', graphqlVariables);
			expect(errors).toBe(undefined);
			expect(thread).toEqual(graphqlResponse.data.getThread);
		});

		test('list', async () => {
			const threadsToList = [
				{
					__typename: 'Thread',
					...serverManagedFields,
					topic: 'really cool stuff',
				},
			];

			const graphqlVariables = {
				filter: {
					topic: { contains: 'really cool stuff' },
				},
				nextToken: null,
			};

			const graphqlResponse = {
				data: {
					listThreads: {
						items: threadsToList,
						nextToken: null,
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

			// Customers would not likely annotate the types in both places. They are provided
			// in both places to trigger type errors if the right-hand side changes.
			const result: GraphQLResult<ListThreadsQuery> = await client.graphql<
				GraphQLQuery<ListThreadsQuery>
			>({
				query: untypedQueries.listThreads,
				variables: graphqlVariables,
				authMode: 'apiKey',
			});

			const { items, nextToken } = result.data?.listThreads || {};
			const errors = result.errors;

			expectList(spy, 'listThreads', graphqlVariables);
			expect(errors).toBe(undefined);
			expect(items).toEqual(graphqlResponse.data.listThreads.items);
		});

		test('subscribe', done => {
			const threadToSend = {
				__typename: 'Thread',
				...serverManagedFields,
				topic: 'really cool stuff',
			};

			const graphqlMessage = {
				data: {
					onCreateThread: threadToSend,
				},
			};

			const spy = jest.fn(() => from([graphqlMessage]));
			(raw.GraphQLAPI as any).appSyncRealTime = { subscribe: spy };

			const graphqlVariables = {
				filter: {
					topic: { contains: 'really cool stuff' },
				},
			};

			// Customers would not likely annotate the types in both places. They are provided
			// in both places to trigger type errors if the right-hand side changes.
			const result: GraphqlSubscriptionResult<OnCreateThreadSubscription> =
				client.graphql<GraphQLSubscription<OnCreateThreadSubscription>>({
					query: untypedSubscriptions.onCreateThread,
					variables: graphqlVariables,
					authMode: 'apiKey',
				});

			result.subscribe?.({
				next(message) {
					expectSub(spy, 'onCreateThread', graphqlVariables);
					expect(message.data?.onCreateThread).toEqual(
						graphqlMessage.data.onCreateThread
					);
					done();
				},
				error(error) {
					expect(error).toBeUndefined();
					done('bad news!');
				},
			})!;
		});

		test('can add types to inputs and ouput with a {variables, result} override', () => {
			type MyType = {
				variables: {
					id: string;
				};
				result: Promise<{
					data: { getWidget: { name: string } };
				}>;
			};

			// response doesn't actually matter for this test. but for demonstrative purposes:
			const graphqlResponse = {
				data: {
					getWhatever: {
						name: 'whatever',
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

			// Customer would probably not explicitly add `MyType["result"]` in their code.
			// But to ensure the test fails if graphql() returns the wrong type, it's explcit here:
			const result: MyType['result'] = client.graphql<MyType>({
				query: 'query GetWidget($id: ID!) { getWidget(id: $id) { name } }',
				variables: {
					id: 'works',
				},
			});

			// Nothing to assert. Test is just intended to fail if types misalign.
		});
	});
});

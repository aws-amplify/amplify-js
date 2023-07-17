import * as raw from '../src';
import { graphql } from '../src/internals/v6';
import * as typedQueries from './fixtures/with-types/queries';
import * as typedMutations from './fixtures/with-types/mutations';
import * as typedSubscriptions from './fixtures/with-types/subscriptions';
import * as untypedQueries from './fixtures/without-types/queries';
import * as untypedMutations from './fixtures/without-types/mutations';
import * as untypedSubscriptions from './fixtures/without-types/subscriptions';
import { Observable } from 'zen-observable-ts';
import { InternalPubSub } from '@aws-amplify/pubsub/internals';
import {
	expectGet,
	expectList,
	expectMutation,
	expectSub,
} from './utils/expects';

import { GraphQLResult } from '../src/types';
import {
	CreateThreadMutation,
	UpdateThreadMutation,
	DeleteThreadMutation,
	GetThreadQuery,
	ListThreadsQuery,
	OnCreateThreadSubscription,
} from './fixtures/with-types/API';

const serverManagedFields = {
	id: 'some-id',
	owner: 'wirejobviously',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

describe('client', () => {
	// TODO: use `generateClient()`
	const client = { graphql };

	beforeEach(() => {
		raw.GraphQLAPI.configure({
			aws_appsync_apiKey: 'FAKE-KEY',
			aws_appsync_authenticationType: 'API_KEY',
			aws_appsync_graphqlEndpoint: 'https://localhost/graphql',
		});
		// TODO:
		// client = generateClient();
	});

	afterEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
		delete (raw.GraphQLAPI as any)._api;
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
				.mockImplementation(() => graphqlResponse);

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<CreateThreadMutation> = await client.graphql({
				query: typedMutations.createThread,
				authMode: 'API_KEY',
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
				.mockImplementation(() => graphqlResponse);

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<UpdateThreadMutation> = await client.graphql({
				query: typedMutations.updateThread,
				variables: {
					input: threadToUpdate,
				},
				authMode: 'API_KEY',
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
				.mockImplementation(() => graphqlResponse);

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<DeleteThreadMutation> = await client.graphql({
				query: typedMutations.deleteThread,
				variables: {
					input: threadToDelete,
				},
				authMode: 'API_KEY',
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
				.mockImplementation(() => graphqlResponse);

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<GetThreadQuery> = await client.graphql({
				query: typedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'API_KEY',
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
				.mockImplementation(() => graphqlResponse);

			// Customers should normally omit the type. Making it explicit to ensure the test
			// fails if the returned changes.
			const result: GraphQLResult<ListThreadsQuery> = await client.graphql({
				query: typedQueries.listThreads,
				variables: graphqlVariables,
				authMode: 'API_KEY',
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
				provider: 'meh' as any,
				value: {
					data: {
						onCreateThread: threadToSend,
					},
				},
			};

			const spy = (InternalPubSub.subscribe = jest.fn(() =>
				Observable.from([graphqlMessage])
			));

			const graphqlVariables = {
				filter: {
					topic: { contains: 'really cool stuff' },
				},
			};

			const sub = client
				.graphql({
					query: typedSubscriptions.onCreateThread,
					variables: graphqlVariables,
					authMode: 'API_KEY',
				})
				.subscribe({
					next(message) {
						expectSub(spy, 'onCreateThread', graphqlVariables);
						expect(message.value.data.onCreateThread).toEqual(
							graphqlMessage.value.data.onCreateThread
						);
						sub.unsubscribe();
						done();
					},
					error(error) {
						expect(error).toBeUndefined();
						sub.unsubscribe();
						done('bad news!');
					},
				});
		});
	});

	describe('un-tagged graphql', () => {
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

			const result = await client.graphql({
				query: untypedMutations.createThread,
				authMode: 'API_KEY',
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
				.mockImplementation(() => graphqlResponse);

			const result = await client.graphql({
				query: untypedMutations.updateThread,
				variables: {
					input: threadToUpdate,
				},
				authMode: 'API_KEY',
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
				.mockImplementation(() => graphqlResponse);

			const result = await client.graphql({
				query: untypedMutations.deleteThread,
				variables: {
					input: threadToDelete,
				},
				authMode: 'API_KEY',
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
				.mockImplementation(() => graphqlResponse);

			const result = await client.graphql({
				query: untypedQueries.getThread,
				variables: graphqlVariables,
				authMode: 'API_KEY',
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
				.mockImplementation(() => graphqlResponse);

			const result = await client.graphql({
				query: untypedQueries.listThreads,
				variables: graphqlVariables,
				authMode: 'API_KEY',
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
				provider: 'meh' as any,
				value: {
					data: {
						onCreateThread: threadToSend,
					},
				},
			};

			const spy = (InternalPubSub.subscribe = jest.fn(() =>
				Observable.from([graphqlMessage])
			));

			const graphqlVariables = {
				filter: {
					topic: { contains: 'really cool stuff' },
				},
			};

			const sub = client
				.graphql({
					query: untypedSubscriptions.onCreateThread,
					variables: graphqlVariables,
					authMode: 'API_KEY',
				})
				.subscribe?.({
					next(message) {
						expectSub(spy, 'onCreateThread', graphqlVariables);
						expect(message.value.data.onCreateThread).toEqual(
							graphqlMessage.value.data.onCreateThread
						);
						sub.unsubscribe();
						done();
					},
					error(error) {
						expect(error).toBeUndefined();
						sub.unsubscribe();
						done('bad news!');
					},
				})!;
		});
	});
});

import * as v5 from '../src';
import { graphql } from '../src/internals/v6';
import * as queries from './fixtures/with-types/queries';
import * as mutations from './fixtures/with-types/mutations';
import * as subscriptions from './fixtures/with-types/subscriptions';
import { Observable } from 'zen-observable-ts';
import { InternalPubSub } from '@aws-amplify/pubsub/internals';

function expectMutation(
	spy: jest.SpyInstance<any, any>,
	opName: string,
	item: Record<string, any>
) {
	// TODO: prod implementation to parse and compare graphql trees deeply?
	expect(spy).toHaveBeenCalledWith(
		'https://localhost/graphql',
		expect.objectContaining({
			headers: expect.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
			body: expect.objectContaining({
				query: expect.stringContaining(
					`${opName}(input: $input, condition: $condition)`
				),
				variables: expect.objectContaining({
					input: expect.objectContaining(item),
				}),
			}),
		})
	);
}

function expectGet(
	spy: jest.SpyInstance<any, any>,
	opName: string,
	item: Record<string, any>
) {
	// TODO: prod implementation to parse and compare graphql trees deeply?
	expect(spy).toHaveBeenCalledWith(
		'https://localhost/graphql',
		expect.objectContaining({
			headers: expect.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
			body: expect.objectContaining({
				query: expect.stringContaining(`${opName}(id: $id)`),
				variables: expect.objectContaining(item),
			}),
		})
	);
}

function expectList(
	spy: jest.SpyInstance<any, any>,
	opName: string,
	item: Record<string, any>
) {
	// TODO: prod implementation to parse and compare graphql trees deeply?
	expect(spy).toHaveBeenCalledWith(
		'https://localhost/graphql',
		expect.objectContaining({
			headers: expect.objectContaining({ 'X-Api-Key': 'FAKE-KEY' }),
			body: expect.objectContaining({
				query: expect.stringContaining(
					`${opName}(filter: $filter, limit: $limit, nextToken: $nextToken)`
				),
				variables: expect.objectContaining(item),
			}),
		})
	);
}

function expectSub(
	spy: jest.SpyInstance<any, any>,
	opName: string,
	item: Record<string, any>
) {
	// TODO: prod implementation to parse and compare graphql trees deeply?
	expect(spy).toHaveBeenCalledWith(
		'',
		expect.objectContaining({
			authenticationType: 'API_KEY',
			apiKey: 'FAKE-KEY',
			appSyncGraphqlEndpoint: 'https://localhost/graphql',
			query: expect.stringContaining(
				`${opName}(filter: $filter, owner: $owner)`
			),
			variables: expect.objectContaining(item),
		}),
		undefined
	);
}

const serverManagedFields = {
	id: 'some-id',
	owner: 'wirejobviously',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

describe('v6', () => {
	// TODO:
	const v6 = { graphql };

	beforeEach(() => {
		v5.GraphQLAPI.configure({
			aws_appsync_apiKey: 'FAKE-KEY',
			aws_appsync_authenticationType: 'API_KEY',
			aws_appsync_graphqlEndpoint: 'https://localhost/graphql',
		});
		// TODO:
		// v6 = generateClient();
	});

	afterEach(() => {
		jest.resetAllMocks();
		jest.clearAllMocks();
		delete (v5.GraphQLAPI as any)._api;
	});

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
			.spyOn((v5.GraphQLAPI as any)._api, 'post')
			.mockImplementation(() => graphqlResponse);

		const result = await v6.graphql({
			query: mutations.createThread,
			variables: {
				input: threadToCreate,
			},
			authMode: 'API_KEY',
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
			.spyOn((v5.GraphQLAPI as any)._api, 'post')
			.mockImplementation(() => graphqlResponse);

		const result = await v6.graphql({
			query: mutations.updateThread,
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
			.spyOn((v5.GraphQLAPI as any)._api, 'post')
			.mockImplementation(() => graphqlResponse);

		const result = await v6.graphql({
			query: mutations.deleteThread,
			variables: {
				input: threadToDelete,
			},
			authMode: 'API_KEY',
		});

		const thread = result.data?.deleteThread;
		2;
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
			.spyOn((v5.GraphQLAPI as any)._api, 'post')
			.mockImplementation(() => graphqlResponse);

		const result = await v6.graphql({
			query: queries.getThread,
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
			.spyOn((v5.GraphQLAPI as any)._api, 'post')
			.mockImplementation(() => graphqlResponse);

		const result = await v6.graphql({
			query: queries.listThreads,
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

		const sub = v6
			.graphql({
				query: subscriptions.onCreateThread,
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

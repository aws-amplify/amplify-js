import * as v5 from '../src';
import * as v6 from '../src/facade-2';
import * as queries from './helpers/fixtures/queries';
import * as mutations from './helpers/fixtures/mutations';
import * as subscriptions from './helpers/fixtures/subscriptions';

import { GraphqlQueryParams } from '../src/types/facade-2-types';

describe('v6', () => {
	beforeEach(() => {
		v5.GraphQLAPI.configure({
			aws_appsync_apiKey: 'FAKE-KEY',
			graphql_endpoint: 'https://localhost/graphql',
		});
	});

	test.only('create', async () => {
		const apiResponse = {
			data: {
				createThread: {
					__typename: 'Thread',
					id: 'thread-id',
					owner: 'wirejobviously',
					topic: 'a very engaging discussion topic',
					createdAt: '2022-02-02T02:02:02',
					updatedAt: '2022-02-02T02:02:02',
				},
			},
		};

		const spy = jest
			.spyOn((v5.GraphQLAPI as any)._api, 'post')
			.mockImplementation(() => apiResponse);

		const result = await v6.mutate(mutations.createThread, {
			input: {
				topic: 'really cool stuff',
			},
			authMode: 'API_KEY',
		});

		const thread = result.data;
		if (thread) {
			thread.id;
		}

		const errors = result.errors;

		expect(spy).toHaveBeenCalled();
		expect(errors).toBe(undefined);
		expect(thread).toEqual(apiResponse.data.createThread);
	});

	test('update', async () => {
		const result = await v6.mutate(mutations.updateThread, {
			input: {
				id: 'abc',
				topic: 'really cool stuff',
			},
			authMode: 'API_KEY',
		});

		const thread = result.data;
		if (thread) {
			thread.id;
		}

		const errors = result.errors;
	});

	test('delete', async () => {
		const result = await v6.mutate(mutations.deleteThread, {
			input: {
				id: 'abc',
			},
			authMode: 'API_KEY',
		});

		const thread = result.data;
		if (thread) {
			thread.id;
		}

		const errors = result.errors;
	});

	test('get', async () => {
		type T = GraphqlQueryParams<typeof queries.getThread, unknown>;
		const result = await v6.query(queries.getThread, {
			id: 'abc',
			authMode: 'API_KEY',
		});

		const thread = result.data;
		if (thread) {
			thread.id;
			thread.comments;
		}

		const errors = result.errors;
	});

	test('list', async () => {
		const result = await v6.query(queries.listThreads, {
			filter: {
				topic: { contains: 'really cool stuff' },
			},
			authMode: 'API_KEY',
			nextToken: null,
		});

		// const { items, nextToken } = result.data || {};
		for await (const thread of result.data || []) {
			// handle thread.
		}
		const errors = result.errors;

		// no next token exposed if using AsyncIterable.
	});

	test('subscribe', async () => {
		const sub = v6
			.subscribe(subscriptions.onCreateThread, {
				filter: {
					topic: { contains: 'really cool stuff' },
				},
				authMode: 'API_KEY',
			})
			.subscribe({
				next(evt) {
					evt.onCreateThread?.id;
				},
				error(e) {
					console.log(e);
				},
			});
		sub.unsubscribe();
	});
});

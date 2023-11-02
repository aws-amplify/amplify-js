import * as raw from '../../src';
import { Amplify, ResourcesConfig } from '@aws-amplify/core';
import { generateClient } from '../../src/internals/server';
import configFixture from '../fixtures/modeled/amplifyconfiguration';
import { Schema } from '../fixtures/modeled/schema';
import { V6ClientSSRRequest, V6ClientSSRCookies } from '../../src/types';

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

describe('server generateClient', () => {
	describe('with cookies', () => {
		test('subscriptions are disabled', () => {
			const getAmplify = async fn => await fn(Amplify);

			const client = generateClient<Schema, V6ClientSSRCookies<Schema>>({
				amplify: getAmplify,
				config: config,
			});

			expect(() => {
				// @ts-expect-error
				client.models.Note.onCreate().subscribe();
			}).toThrowError();
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

			const getAmplify = async fn => await fn(Amplify);

			const client = generateClient<Schema, V6ClientSSRCookies<Schema>>({
				amplify: getAmplify,
				config: config,
			});

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
							// match nextToken in selection set
							query: expect.stringMatching(/^\s*nextToken\s*$/m),
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

			const getAmplify = async fn => await fn(Amplify);

			const client = generateClient<Schema, V6ClientSSRCookies<Schema>>({
				amplify: getAmplify,
				config: config,
			});

			const { data } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
				nextToken: 'some-token',
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
								nextToken: 'some-token',
							},
						},
					}),
				})
			);

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						body: expect.objectContaining({
							// match nextToken in selection set
							query: expect.stringMatching(/^\s*nextToken\s*$/m),
						}),
					}),
				})
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

			const getAmplify = async fn => await fn(Amplify);

			const client = generateClient<Schema, V6ClientSSRCookies<Schema>>({
				amplify: getAmplify,
				config: config,
			});

			const { data } = await client.models.Todo.list({
				filter: { name: { contains: 'name' } },
				limit: 5,
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
								limit: 5,
							},
						},
					}),
				})
			);

			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						body: expect.objectContaining({
							// match nextToken in selection set
							query: expect.stringMatching(/^\s*nextToken\s*$/m),
						}),
					}),
				})
			);
		});
	});
	describe('with request', () => {
		test('subscriptions are disabled', () => {
			const client = generateClient<Schema, V6ClientSSRRequest<Schema>>({
				amplify: null,
				config: config,
			});

			expect(() => {
				// @ts-expect-error
				client.models.Note.onCreate().subscribe();
			}).toThrowError();
		});
	});
});

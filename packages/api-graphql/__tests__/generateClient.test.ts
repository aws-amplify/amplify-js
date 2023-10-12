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

	describe.only('with model', () => {
		beforeEach(() => {
			jest.clearAllMocks();
			Amplify.configure(configFixture as any);
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
			const result = await client.models.Todo.get({ id: 'asdf' });
			console.log(spy.mock.calls);
			console.log(result);
			expect(spy).toHaveBeenCalled();
		});
		// test('can list()', async () => {});
	});
});

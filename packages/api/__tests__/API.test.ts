import { ResourcesConfig } from 'aws-amplify';
import { InternalGraphQLAPIClass } from '@aws-amplify/api-graphql/internals';
import { generateClient, CONNECTION_STATE_CHANGE } from '@aws-amplify/api';
import { AmplifyClassV6 } from '@aws-amplify/core';
// import { runWithAmplifyServerContext } from 'aws-amplify/internals/adapter-core';

const serverManagedFields = {
	id: 'some-id',
	owner: 'wirejobviously',
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

describe('API generateClient', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	test('client-side client.graphql', async () => {
		jest.spyOn(AmplifyClassV6.prototype, 'getConfig').mockImplementation(() => {
			return {
				API: { GraphQL: { endpoint: 'test', defaultAuthMode: 'none' } },
			};
		});
		const spy = jest
			.spyOn(InternalGraphQLAPIClass.prototype, 'graphql')
			.mockResolvedValue('grapqhqlResponse' as any);
		const client = generateClient();
		expect(await client.graphql({ query: 'query' })).toBe('grapqhqlResponse');
		expect(spy).toHaveBeenCalledWith(
			{ Auth: {}, libraryOptions: {}, resourcesConfig: {} },
			{ query: 'query' },
			undefined,
			{
				action: '1',
				category: 'api',
			}
		);
	});

	test('CONNECTION_STATE_CHANGE importable as a value, not a type', async () => {
		expect(CONNECTION_STATE_CHANGE).toBe('ConnectionStateChange');
	})
	// test('server-side client.graphql', async () => {
	// 	const config: ResourcesConfig = {
	// 		API: {
	// 			GraphQL: {
	// 				apiKey: 'adsf',
	// 				customEndpoint: undefined,
	// 				customEndpointRegion: undefined,
	// 				defaultAuthMode: 'apiKey',
	// 				endpoint: 'https://0.0.0.0/graphql',
	// 				region: 'us-east-1',
	// 			},
	// 		},
	// 	};

	// 	const query = `query Q {
	// 		getWidget {
	// 			__typename id owner createdAt updatedAt someField
	// 		}
	// 	}`;

	// 	const spy = jest
	// 		.spyOn(InternalGraphQLAPIClass.prototype, 'graphql')
	// 		.mockResolvedValue('grapqhqlResponse' as any);

	// 	await runWithAmplifyServerContext(config, {}, ctx => {
	// 		const client = generateClientSSR(ctx);
	// 		return client.graphql({ query }) as any;
	// 	});

	// 	expect(spy).toHaveBeenCalledWith(
	// 		expect.objectContaining({
	// 			resourcesConfig: config,
	// 		}),
	// 		{ query },
	// 		undefined
	// 	);
	// });
});

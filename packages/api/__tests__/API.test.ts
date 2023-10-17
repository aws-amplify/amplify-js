import { ResourcesConfig } from 'aws-amplify';
import { InternalGraphQLAPIClass } from '@aws-amplify/api-graphql/internals';
import { generateClient } from '@aws-amplify/api';
import { generateClient as generateClientSSR } from '@aws-amplify/api/server';
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
		const spy = jest
			.spyOn(InternalGraphQLAPIClass.prototype, 'graphql')
			.mockResolvedValue('grapqhqlResponse' as any);
		const client = generateClient();
		expect(await client.graphql({ query: 'query' })).toBe('grapqhqlResponse');
		expect(spy).toBeCalledWith(
			{ Auth: {}, libraryOptions: {}, resourcesConfig: {} },
			{ query: 'query' },
			undefined,
			{
				action: '1',
				category: 'api',
			}
		);
	});

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

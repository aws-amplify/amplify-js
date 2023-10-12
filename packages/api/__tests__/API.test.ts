import { InternalGraphQLAPIClass } from '@aws-amplify/api-graphql/internals';
import { generateClient } from 'aws-amplify/api';

describe('API generateClient', () => {
	test('client.graphql', async () => {
		const spy = jest
			.spyOn(InternalGraphQLAPIClass.prototype, 'graphql')
			.mockResolvedValue('grapqhqlResponse' as any);
		const client = generateClient();
		expect(await client.graphql({ query: 'query' })).toBe('grapqhqlResponse');
		expect(spy).toBeCalledWith(
			{ Auth: {}, cachedResourcesConfig: {}, libraryOptions: {}, resourcesConfig: {} },
			{ query: 'query' },
			undefined
		);
	});
});

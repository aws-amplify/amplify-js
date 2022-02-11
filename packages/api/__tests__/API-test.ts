import { RestAPIClass } from '@aws-amplify/api-rest';
import { GraphQLAPIClass } from '@aws-amplify/api-graphql';
import { APIClass as API } from '../src/API';

describe('API test', () => {
	test('configure', () => {
		jest
			.spyOn(RestAPIClass.prototype, 'configure')
			.mockReturnValue({ restapi: 'configured' });
		jest
			.spyOn(GraphQLAPIClass.prototype, 'configure')
			.mockReturnValue({ graphqlapi: 'configured' });
		const api = new API(null);
		expect(api.configure(null)).toStrictEqual({
			graphqlapi: 'configured',
			restapi: 'configured',
		});
	});

	test('get', async () => {
		jest.spyOn(RestAPIClass.prototype, 'get').mockResolvedValue('getResponse');
		const api = new API(null);
		expect(await api.get(null, null, null)).toBe('getResponse');
	});

	test('post', async () => {
		jest
			.spyOn(RestAPIClass.prototype, 'post')
			.mockResolvedValue('postResponse');
		const api = new API(null);
		expect(await api.post(null, null, null)).toBe('postResponse');
	});

	test('put', async () => {
		jest.spyOn(RestAPIClass.prototype, 'put').mockResolvedValue('putResponse');
		const api = new API(null);
		expect(await api.put(null, null, null)).toBe('putResponse');
	});

	test('patch', async () => {
		jest
			.spyOn(RestAPIClass.prototype, 'patch')
			.mockResolvedValue('patchResponse');
		const api = new API(null);
		expect(await api.patch(null, null, null)).toBe('patchResponse');
	});

	test('del', async () => {
		jest.spyOn(RestAPIClass.prototype, 'del').mockResolvedValue('delResponse');
		const api = new API(null);
		expect(await api.del(null, null, null)).toBe('delResponse');
	});

	test('head', async () => {
		jest
			.spyOn(RestAPIClass.prototype, 'head')
			.mockResolvedValue('headResponse');
		const api = new API(null);
		expect(await api.head(null, null, null)).toBe('headResponse');
	});

	test('endpoint', async () => {
		jest
			.spyOn(RestAPIClass.prototype, 'endpoint')
			.mockResolvedValue('endpointResponse');
		const api = new API(null);
		expect(await api.endpoint(null)).toBe('endpointResponse');
	});

	test('getGraphqlOperationType', () => {
		jest
			.spyOn(GraphQLAPIClass.prototype, 'getGraphqlOperationType')
			.mockReturnValueOnce('getGraphqlOperationTypeResponse' as any);
		const api = new API(null);
		expect(api.getGraphqlOperationType(null)).toBe(
			'getGraphqlOperationTypeResponse'
		);
	});

	test('graphql', async () => {
		jest
			.spyOn(GraphQLAPIClass.prototype, 'graphql')
			.mockResolvedValue('grapqhqlResponse' as any);
		const api = new API(null);
		expect(await api.graphql(null)).toBe('grapqhqlResponse');
	});

	describe('cancel', () => {
		test('cancel RestAPI request', async () => {
			jest
				.spyOn(GraphQLAPIClass.prototype, 'cancel')
				.mockImplementation(() => false);
			const restAPICancelSpy = jest
				.spyOn(RestAPIClass.prototype, 'cancel')
				.mockImplementation(() => true);
			const api = new API(null);
			const request = Promise.resolve();
			expect(api.cancel(request)).toBe(true);
			expect(restAPICancelSpy).toHaveBeenCalled();
		});

		test('cancel GraphQLAPI request', async () => {
			const graphQLAPICancelSpy = jest
				.spyOn(GraphQLAPIClass.prototype, 'cancel')
				.mockImplementation(() => true);
			jest
				.spyOn(RestAPIClass.prototype, 'cancel')
				.mockImplementation(() => false);
			const api = new API(null);
			const request = Promise.resolve();
			expect(api.cancel(request)).toBe(true);
			expect(graphQLAPICancelSpy).toHaveBeenCalled();
		});
	});
});

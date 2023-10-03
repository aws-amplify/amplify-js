// import { RestAPIClass } from '@aws-amplify/api-rest';
// import { InternalGraphQLAPIClass } from '@aws-amplify/api-graphql/internals';
// import { APIClass as API } from '../src/API';
// import { ApiAction, Category } from '@aws-amplify/core/internals/utils';

// describe('API test', () => {
// 	test('configure', () => {
// 		jest
// 			.spyOn(RestAPIClass.prototype, 'configure')
// 			.mockReturnValue({ restapi: 'configured' });
// 		jest
// 			.spyOn(InternalGraphQLAPIClass.prototype, 'configure')
// 			.mockReturnValue({ graphqlapi: 'configured' });
// 		const api = new API(null);
// 		expect(api.configure(null)).toStrictEqual({
// 			graphqlapi: 'configured',
// 			restapi: 'configured',
// 		});
// 	});

// 	test('get', async () => {
// 		const spy = jest
// 			.spyOn(RestAPIClass.prototype, 'get')
// 			.mockResolvedValue('getResponse');
// 		const api = new API(null);
// 		expect(await api.get(null, null, null)).toBe('getResponse');

// 		expect(spy).toBeCalledWith(null, null, {
// 			customUserAgentDetails: {
// 				category: Category.API,
// 				action: ApiAction.Get,
// 			},
// 		});
// 	});

// 	test('post', async () => {
// 		const spy = jest
// 			.spyOn(RestAPIClass.prototype, 'post')
// 			.mockResolvedValue('postResponse');
// 		const api = new API(null);
// 		expect(await api.post(null, null, null)).toBe('postResponse');

// 		expect(spy).toBeCalledWith(null, null, {
// 			customUserAgentDetails: {
// 				category: Category.API,
// 				action: ApiAction.Post,
// 			},
// 		});
// 	});

// 	test('put', async () => {
// 		const spy = jest
// 			.spyOn(RestAPIClass.prototype, 'put')
// 			.mockResolvedValue('putResponse');
// 		const api = new API(null);
// 		expect(await api.put(null, null, null)).toBe('putResponse');

// 		expect(spy).toBeCalledWith(null, null, {
// 			customUserAgentDetails: {
// 				category: Category.API,
// 				action: ApiAction.Put,
// 			},
// 		});
// 	});

// 	test('patch', async () => {
// 		const spy = jest
// 			.spyOn(RestAPIClass.prototype, 'patch')
// 			.mockResolvedValue('patchResponse');
// 		const api = new API(null);
// 		expect(await api.patch(null, null, null)).toBe('patchResponse');

// 		expect(spy).toBeCalledWith(null, null, {
// 			customUserAgentDetails: {
// 				category: Category.API,
// 				action: ApiAction.Patch,
// 			},
// 		});
// 	});

// 	test('del', async () => {
// 		jest.spyOn(RestAPIClass.prototype, 'del').mockResolvedValue('delResponse');
// 		const api = new API(null);
// 		expect(await api.del(null, null, null)).toBe('delResponse');
// 	});

// 	test('head', async () => {
// 		const spy = jest
// 			.spyOn(RestAPIClass.prototype, 'head')
// 			.mockResolvedValue('headResponse');
// 		const api = new API(null);
// 		expect(await api.head(null, null, null)).toBe('headResponse');

// 		expect(spy).toBeCalledWith(null, null, {
// 			customUserAgentDetails: {
// 				category: Category.API,
// 				action: ApiAction.Head,
// 			},
// 		});
// 	});

// 	test('endpoint', async () => {
// 		jest
// 			.spyOn(RestAPIClass.prototype, 'endpoint')
// 			.mockResolvedValue('endpointResponse');
// 		const api = new API(null);
// 		expect(await api.endpoint(null)).toBe('endpointResponse');
// 	});

// 	test('getGraphqlOperationType', () => {
// 		jest
// 			.spyOn(InternalGraphQLAPIClass.prototype, 'getGraphqlOperationType')
// 			.mockReturnValueOnce('getGraphqlOperationTypeResponse' as any);
// 		const api = new API(null);
// 		expect(api.getGraphqlOperationType(null)).toBe(
// 			'getGraphqlOperationTypeResponse'
// 		);
// 	});

// 	test('graphql', async () => {
// 		const spy = jest
// 			.spyOn(InternalGraphQLAPIClass.prototype, 'graphql')
// 			.mockResolvedValue('grapqhqlResponse' as any);
// 		const api = new API(null);
// 		expect(await api.graphql({ query: 'query' })).toBe('grapqhqlResponse');

// 		expect(spy).toBeCalledWith(expect.anything(), undefined, {
// 			category: Category.API,
// 			action: ApiAction.GraphQl,
// 		});
// 	});

// 	describe('cancel', () => {
// 		test('cancel RestAPI request', async () => {
// 			jest
// 				.spyOn(InternalGraphQLAPIClass.prototype, 'hasCancelToken')
// 				.mockImplementation(() => false);
// 			const restAPICancelSpy = jest
// 				.spyOn(RestAPIClass.prototype, 'cancel')
// 				.mockImplementation(() => true);
// 			jest
// 				.spyOn(RestAPIClass.prototype, 'hasCancelToken')
// 				.mockImplementation(() => true);
// 			const api = new API(null);
// 			const request = Promise.resolve();
// 			expect(api.cancel(request)).toBe(true);
// 			expect(restAPICancelSpy).toHaveBeenCalled();
// 		});

// 		test('cancel GraphQLAPI request', async () => {
// 			jest
// 				.spyOn(InternalGraphQLAPIClass.prototype, 'hasCancelToken')
// 				.mockImplementation(() => true);
// 			const graphQLAPICancelSpy = jest
// 				.spyOn(InternalGraphQLAPIClass.prototype, 'cancel')
// 				.mockImplementation(() => true);
// 			jest
// 				.spyOn(RestAPIClass.prototype, 'hasCancelToken')
// 				.mockImplementation(() => false);
// 			const api = new API(null);
// 			const request = Promise.resolve();
// 			expect(api.cancel(request)).toBe(true);
// 			expect(graphQLAPICancelSpy).toHaveBeenCalled();
// 		});
// 	});
// });
// TODO(v6): add tests
describe.skip('API tests', () => {
	test('add tests', async () => {});
});

import { cancel } from '@aws-amplify/api-rest/internals';
import { InternalGraphQLAPIClass } from '@aws-amplify/api-graphql/internals';
import { generateClient } from 'aws-amplify/api';

describe('API generateClient', () => {
	test('client.graphql', async () => {
		const spy = jest
			.spyOn(InternalGraphQLAPIClass.prototype, 'graphql')
			.mockResolvedValue('grapqhqlResponse' as any);
		const client = generateClient();
		expect(await client.graphql({ query: 'query' })).toBe('grapqhqlResponse');
		expect(spy).toBeCalledWith({ query: 'query' }, undefined);
	});

	describe('client.cancel', () => {
		test('cancel RestAPI request', async () => {
			const client = generateClient();
			const request = Promise.resolve();
			expect(client.cancel(request)).toBe(true);
			expect(cancel).toHaveBeenCalled();
		});
	});

	describe('client.isCancelError', () => {
		test('cancel RestAPI request', async () => {
			const client = generateClient();
			const request = Promise.resolve();
			try {
				client.cancel(request, 'this should be my message');
			} catch (e) {
				expect(client.isCancelError(e)).toBe(true);
			}
			expect(cancel).toHaveBeenCalled();
		});
	});
});

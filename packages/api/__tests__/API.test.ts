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
		expect(spy).toBeCalledWith(
			{ Auth: {}, libraryOptions: {}, resourcesConfig: {} },
			{ query: 'query' },
			undefined
		);
	});

	describe('client.cancel', () => {
		test('cancel RestAPI request', async () => {
			const client = generateClient();
			let requestToCancel;

			try {
				const promise = client.graphql({ query: 'query' });
				requestToCancel = promise;
				await promise;
			} catch (e) {
				console.log(e);
			}

			expect(client.cancel(requestToCancel)).toBe(true);
			expect(cancel).toHaveBeenCalled();
		});
	});

	describe('client.isCancelError', () => {
		test('should return `true` when error is due to request cancellation', async () => {
			const client = generateClient();

			// Request that will be canceled:
			const request = Promise.resolve();

			try {
				// Cancel the request:
				client.cancel(request, 'this should be my message');
			} catch (e) {
				/**
				 * An error is thrown on cancellation (expected). Here we
				 * check that the error is a result of the request cancellation.
				 */
				expect(client.isCancelError(e)).toBe(true);
			}
			expect(cancel).toHaveBeenCalled();
		});
		test('should return `false` when error is not due to request cancellation', async () => {
			// Throw an error unrelated to request cancellation:
			const spy = jest
				.spyOn(InternalGraphQLAPIClass.prototype, 'graphql')
				.mockImplementation(() => {
					throw new Error();
				});

			const client = generateClient();

			try {
				// Will throw an error for some other reason:
				await client.graphql({ query: 'query' });
			} catch (e) {
				/**
				 * Validate that the error is not a result of request cancellation:
				 */
				expect(client.isCancelError(e)).toBe(false);
			}
			expect(cancel).toHaveBeenCalled();
		});
	});
});

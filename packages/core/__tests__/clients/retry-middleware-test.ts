import { retry } from '../../src/clients/middleware/retry';

describe(`${retry.name} middleware`, () => {
	const defaultRetryOptions = {
		retryDecider: () => true,
		backOffStrategy: { computeDelay: () => 1 },
	};
	test('should retry specified times', async () => {
		const retryMiddleware = retry();
		const nextHandler = jest.fn().mockResolvedValue('foo');
		const retryableHandler = retryMiddleware(nextHandler, {});
		let resp;
		try {
			resp = await retryableHandler(
				{ url: new URL('https://a.b') },
				{
					...defaultRetryOptions,
					maxAttempts: 6,
				}
			);
		} catch (error) {
			expect(nextHandler).toBeCalledTimes(6);
		}
	});
	test('should call retry decider on whether response is retryable', async () => {});
	test('should call retry decider on whether error is retryable', async () => {});
	test('should call backoff strategy for intervals', async () => {});
	test('can be cancelled', async () => {});
	test('should not proceed if already cancelled', async () => {});
});

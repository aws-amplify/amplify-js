import { retry } from '../../src/clients/middleware/retry';

describe(`${retry.name} middleware`, () => {
	beforeEach(() => {
		// jest.useFakeTimers();
		jest.clearAllMocks();
	});
	const defaultRetryOptions = {
		retryDecider: () => true,
		backOffStrategy: { computeDelay: () => 1 },
	};
	const defaultRequest = { url: new URL('https://a.b') };

	test('should retry specified times', async () => {
		const retryMiddleware = retry();
		const nextHandler = jest.fn().mockResolvedValue('foo');
		const retryableHandler = retryMiddleware(nextHandler, {});
		let resp;
		try {
			resp = await retryableHandler(defaultRequest, {
				...defaultRetryOptions,
				maxAttempts: 6,
			});
			fail('this test should fail');
		} catch (error) {
			expect(nextHandler).toBeCalledTimes(6);
			expect(error.message).toEqual('Retry attempts exhausted');
		}
	});
	test('should call retry decider on whether response is retryable', async () => {
		const retryMiddleware = retry();
		const nextHandler = jest.fn().mockResolvedValue('foo');
		const retryableHandler = retryMiddleware(nextHandler, {});
		const retryDecider = jest
			.fn()
			.mockImplementation(response => response !== 'foo'); // retry if response is not foo
		const resp = await retryableHandler(defaultRequest, {
			...defaultRetryOptions,
			retryDecider,
		});
		expect.assertions(3);
		expect(nextHandler).toBeCalledTimes(1);
		expect(retryDecider).toBeCalledTimes(1);
		expect(resp).toEqual('foo');
	});
	test('should call retry decider on whether error is retryable', async () => {
		const retryMiddleware = retry();
		const nextHandler = jest.fn().mockRejectedValue('UnretryableError');
		const retryableHandler = retryMiddleware(nextHandler, {});
		const retryDecider = jest
			.fn()
			.mockImplementation((resp, error) => error !== 'UnretryableError');
		try {
			const resp = await retryableHandler(defaultRequest, {
				...defaultRetryOptions,
				retryDecider,
			});
			fail('this test should fail');
		} catch (e) {
			expect(e).toBe('UnretryableError');
			expect(nextHandler).toBeCalledTimes(1);
			expect(retryDecider).toBeCalledTimes(1);
			expect(retryDecider).toBeCalledWith(undefined, 'UnretryableError');
		}
		expect.assertions(4);
	});
	test('should call backoff strategy for intervals', async () => {
		const retryMiddleware = retry();
		const nextHandler = jest.fn().mockResolvedValue('foo');
		const retryableHandler = retryMiddleware(nextHandler, {});
		const backOffStrategy = {
			computeDelay: jest.fn().mockImplementation(retry => retry * 100),
		};
		try {
			await retryableHandler(defaultRequest, {
				...defaultRetryOptions,
				maxAttempts: 6,
				backOffStrategy,
			});
			fail('this test should fail');
		} catch (error) {
			expect(error.message).toBe('Retry attempts exhausted');
			expect(nextHandler).toBeCalledTimes(6);
			expect(backOffStrategy.computeDelay).toBeCalledTimes(6);
		}
		expect.assertions(3);
	});
	test('can be cancelled', async () => {
		const retryMiddleware = retry();
		const nextHandler = jest.fn().mockResolvedValue('foo');
		const retryableHandler = retryMiddleware(nextHandler, {});
		const controller = new AbortController();
		controller.abort();
		const resp = await retryableHandler(defaultRequest, {
			...defaultRetryOptions,
			abortSignal: controller.signal,
		});
		expect(resp).toEqual('foo');
	});
	test('should not proceed if already cancelled', async () => {});
	test('track attempts count in context across 2 retry middleware', async () => {});
});

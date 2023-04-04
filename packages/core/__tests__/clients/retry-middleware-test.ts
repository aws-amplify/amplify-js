import { MiddlewareHandler } from '../../src/clients/types';
import { composeTransferHandler } from '../../src/clients/internal/composeTransferHandler';

jest.spyOn(global, 'setTimeout');
jest.spyOn(global, 'clearTimeout');
import { retry, RetryOptions } from '../../src/clients/middleware/retry';

describe(`${retry.name} middleware`, () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	const defaultRetryOptions = {
		retryDecider: () => true,
		backOffStrategy: { computeDelay: () => 1 },
	};
	const defaultRequest = { url: new URL('https://a.b') };
	const getRetryableHandler = (nextHandler: MiddlewareHandler<any, any>) => {
		return composeTransferHandler<any, any, any, [RetryOptions]>(nextHandler, [
			retry,
		]);
	};

	test('should retry specified times', async () => {
		const nextHandler = jest.fn().mockResolvedValue('foo');
		const retryableHandler = getRetryableHandler(nextHandler);
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
		const nextHandler = jest.fn().mockResolvedValue('foo');
		const retryableHandler = getRetryableHandler(nextHandler);
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
		const nextHandler = jest
			.fn()
			.mockRejectedValue(new Error('UnretryableError'));
		const retryableHandler = getRetryableHandler(nextHandler);
		const retryDecider = jest
			.fn()
			.mockImplementation(
				(resp, error) => error.message !== 'UnretryableError'
			);
		try {
			const resp = await retryableHandler(defaultRequest, {
				...defaultRetryOptions,
				retryDecider,
			});
			fail('this test should fail');
		} catch (e) {
			expect(e.message).toBe('UnretryableError');
			expect(nextHandler).toBeCalledTimes(1);
			expect(retryDecider).toBeCalledTimes(1);
			expect(retryDecider).toBeCalledWith(undefined, expect.any(Error));
		}
		expect.assertions(4);
	});

	test('should call backoff strategy for intervals', async () => {
		const nextHandler = jest.fn().mockResolvedValue('foo');
		const retryableHandler = getRetryableHandler(nextHandler);
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
			expect(backOffStrategy.computeDelay).toBeCalledTimes(5); // no interval after last attempt
		}
		expect.assertions(3);
	});

	test('should throw error if request already cancelled', async () => {
		const nextHandler = jest.fn().mockResolvedValue('foo');
		const retryableHandler = getRetryableHandler(nextHandler);
		const controller = new AbortController();
		controller.abort();
		try {
			await retryableHandler(defaultRequest, {
				...defaultRetryOptions,
				abortSignal: controller.signal,
			});
			fail('this test should fail');
		} catch (error) {
			expect(error.message).toBe('Request aborted');
			expect(nextHandler).toBeCalledTimes(0);
		}
		expect.assertions(2);
	});

	test('can be cancelled', async () => {
		// Not using fake timers because of Jest limit: https://github.com/facebook/jest/issues/7151
		const nextHandler = jest.fn().mockResolvedValue('foo');
		const retryableHandler = getRetryableHandler(nextHandler);
		const controller = new AbortController();
		const retryDecider = () => true;
		const backOffStrategy = {
			computeDelay: jest.fn().mockImplementation(attempt => {
				if (attempt === 1) {
					setTimeout(() => controller.abort(), 100);
				}
				return 200;
			}),
		};
		try {
			await retryableHandler(defaultRequest, {
				...defaultRetryOptions,
				abortSignal: controller.signal,
				backOffStrategy,
				retryDecider,
			});
			fail('this test should fail');
		} catch (error) {
			expect(error.message).toBe('Request aborted');
			expect(setTimeout).toBeCalledTimes(2); // 1st attempt + mock back-off strategy
			expect(clearTimeout).toBeCalledTimes(1); // cancel 2nd attempt
		}
	});
	test('track attempts count in context across 2 retry middleware', async () => {
		// middleware after 2nd retry middleware;
		const coreHandler = jest
			.fn()
			.mockRejectedValueOnce(new Error('CoreRetryableError'))
			.mockResolvedValue('foo');
		const betweenRetryFunction = jest
			.fn()
			.mockRejectedValueOnce(new Error('MiddlewareRetryableError'))
			.mockResolvedValue(void 0);
		const betweenRetryMiddleware =
			() => (next: any, context: any) => async (args: any) => {
				await betweenRetryFunction(args, context);
				return next(args);
			};

		const doubleRetryableHandler = composeTransferHandler<
			any,
			any,
			any,
			[RetryOptions, {}, RetryOptions]
		>(coreHandler, [retry, betweenRetryMiddleware, retry]);

		const retryDecider = jest
			.fn()
			.mockImplementation((response, error: Error) => {
				if (error && error.message.endsWith('RetryableError')) return true;
				return false;
			});
		const backOffStrategy = {
			computeDelay: jest.fn().mockReturnValue(0),
		};
		const response = await doubleRetryableHandler(defaultRequest, {
			...defaultRetryOptions,
			retryDecider,
			backOffStrategy,
		});

		expect(response).toEqual('foo');
		expect(coreHandler).toBeCalledTimes(2);
		expect(betweenRetryFunction).toBeCalledTimes(2);
		expect(retryDecider).toBeCalledTimes(4);
		// backOffStrategy is called regardless whether from different retry middleware.
		expect(backOffStrategy.computeDelay).toHaveBeenNthCalledWith(1, 1);
		expect(backOffStrategy.computeDelay).toHaveBeenNthCalledWith(2, 2);
	});
});

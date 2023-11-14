// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse, MiddlewareHandler } from '../../../../src/clients/types';
import { composeTransferHandler } from '../../../../src/clients/internal/composeTransferHandler';
import {
	retryMiddleware,
	RetryOptions,
} from '../../../../src/clients/middleware/retry';

jest.spyOn(global, 'setTimeout');
jest.spyOn(global, 'clearTimeout');

describe(`${retryMiddleware.name} middleware`, () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const defaultRetryOptions = {
		retryDecider: async () => true,
		computeDelay: () => 1,
	};
	const defaultRequest = { url: new URL('https://a.b') };
	const defaultResponse: HttpResponse = {
		body: 'foo' as any,
		statusCode: 200,
		headers: {},
	};
	const getRetryableHandler = (nextHandler: MiddlewareHandler<any, any>) =>
		composeTransferHandler<[RetryOptions]>(nextHandler, [retryMiddleware]);

	test('should retry specified times', async () => {
		const nextHandler = jest.fn().mockResolvedValue(defaultResponse);
		const retryableHandler = getRetryableHandler(nextHandler);
		expect.assertions(2);
		try {
			const resp = await retryableHandler(defaultRequest, {
				...defaultRetryOptions,
				maxAttempts: 6,
			});
			expect(nextHandler).toHaveBeenCalledTimes(6);
			expect(resp).toEqual({ ...defaultResponse, $metadata: { attempts: 6 } });
		} catch (error) {
			fail('this test should succeed');
		}
	});

	test('should throw last error if max attempts is reached', async () => {
		let nextHandlerInvocations = 0;
		const nextHandler = jest.fn().mockImplementation(async () => {
			throw new Error(`Error ${++nextHandlerInvocations}`);
		});
		const retryableHandler = getRetryableHandler(nextHandler);
		expect.assertions(2);
		let resp;
		try {
			resp = await retryableHandler(defaultRequest, {
				...defaultRetryOptions,
				maxAttempts: 6,
			});
			fail('this test should fail');
		} catch (error: any) {
			expect(nextHandler).toHaveBeenCalledTimes(6);
			expect(error.message).toEqual('Error 6');
		}
	});

	test('should call retry decider on whether response is retryable', async () => {
		const nextHandler = jest.fn().mockResolvedValue(defaultResponse);
		const retryableHandler = getRetryableHandler(nextHandler);
		const retryDecider = jest
			.fn()
			.mockImplementation(response => response.body !== 'foo'); // retry if response is not foo
		const resp = await retryableHandler(defaultRequest, {
			...defaultRetryOptions,
			retryDecider,
		});
		expect.assertions(3);
		expect(nextHandler).toHaveBeenCalledTimes(1);
		expect(retryDecider).toHaveBeenCalledTimes(1);
		expect(resp).toEqual({ ...defaultResponse, $metadata: { attempts: 1 } });
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
		} catch (e: any) {
			expect(e.message).toBe('UnretryableError');
			expect(nextHandler).toHaveBeenCalledTimes(1);
			expect(retryDecider).toHaveBeenCalledTimes(1);
			expect(retryDecider).toHaveBeenCalledWith(undefined, expect.any(Error));
		}
		expect.assertions(4);
	});

	test('should call computeDelay for intervals', async () => {
		const nextHandler = jest.fn().mockResolvedValue(defaultResponse);
		const retryableHandler = getRetryableHandler(nextHandler);
		const computeDelay = jest.fn().mockImplementation(retry => retry * 100);
		try {
			const res = await retryableHandler(defaultRequest, {
				...defaultRetryOptions,
				maxAttempts: 6,
				computeDelay,
			});
			expect(res).toEqual(
				expect.objectContaining({ $metadata: { attempts: 6 } })
			);
			expect(nextHandler).toHaveBeenCalledTimes(6);
			expect(computeDelay).toHaveBeenCalledTimes(5); // no interval after last attempt
		} catch (error) {
			fail('this test should fail');
		}
		expect.assertions(3);
	});

	test('should throw error if request already cancelled', async () => {
		const nextHandler = jest.fn().mockResolvedValue(defaultResponse);
		const retryableHandler = getRetryableHandler(nextHandler);
		const controller = new AbortController();
		controller.abort();
		try {
			await retryableHandler(defaultRequest, {
				...defaultRetryOptions,
				abortSignal: controller.signal,
			});
			fail('this test should fail');
		} catch (error: any) {
			expect(error.message).toBe('Request aborted.');
			expect(nextHandler).toHaveBeenCalledTimes(0);
		}
		expect.assertions(2);
	});

	test('can be cancelled', async () => {
		// Not using fake timers because of Jest limit: https://github.com/facebook/jest/issues/7151
		const nextHandler = jest.fn().mockResolvedValue(defaultResponse);
		const retryableHandler = getRetryableHandler(nextHandler);
		const controller = new AbortController();
		const retryDecider = async () => true;
		const computeDelay = jest.fn().mockImplementation(attempt => {
			if (attempt === 1) {
				setTimeout(() => controller.abort(), 100);
			}
			return 200;
		});
		try {
			await retryableHandler(defaultRequest, {
				...defaultRetryOptions,
				abortSignal: controller.signal,
				computeDelay,
				retryDecider,
			});
			fail('this test should fail');
		} catch (error: any) {
			expect(error.message).toBe('Request aborted.');
			expect(setTimeout).toHaveBeenCalledTimes(2); // 1st attempt + mock back-off strategy
			expect(clearTimeout).toHaveBeenCalledTimes(1); // cancel 2nd attempt
		}
	});

	test('should support 2 retry middleware tracking the same retry count', async () => {
		const coreHandler = jest
			.fn()
			.mockRejectedValueOnce(new Error('CoreRetryableError'))
			.mockResolvedValue(defaultResponse);
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
			[RetryOptions, {}, RetryOptions]
		>(coreHandler, [retryMiddleware, betweenRetryMiddleware, retryMiddleware]);

		const retryDecider = jest
			.fn()
			.mockImplementation((response, error: Error) => {
				if (error && error.message.endsWith('RetryableError')) return true;
				return false;
			});
		const computeDelay = jest.fn().mockReturnValue(0);
		const response = await doubleRetryableHandler(defaultRequest, {
			...defaultRetryOptions,
			retryDecider,
			computeDelay,
		});

		expect(response).toEqual({
			...defaultResponse,
			$metadata: { attempts: 3 },
		});
		expect(coreHandler).toHaveBeenCalledTimes(2);
		expect(betweenRetryFunction).toHaveBeenCalledTimes(2);
		expect(retryDecider).toHaveBeenCalledTimes(4);
		// computeDelay is called by 2 retry middleware with continuous attempts count.
		expect(computeDelay).toHaveBeenNthCalledWith(1, 1);
		expect(computeDelay).toHaveBeenNthCalledWith(2, 2);
	});
});

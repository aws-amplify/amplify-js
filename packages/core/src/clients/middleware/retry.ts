import {
	MiddlewareContext,
	MiddlewareHandler,
	Request,
	Response,
} from '../types/core';

const DEFAULT_RETRY_ATTEMPTS = 3;
const CONTEXT_KEY_RETRY_COUNT = 'attemptsCount';

/**
 * Configuration of the retry middleware
 */
export interface RetryOptions {
	/**
	 * Function to decide if the request should be retried.
	 *
	 * @param response Response of the request.
	 * @param error Optional error thrown from previous attempts.
	 * @returns True if the request should be retried.
	 */
	retryDecider: (response: Response, error?: unknown) => boolean;
	/**
	 * Strategy to compute the delay before the next retry.
	 */
	backOffStrategy: {
		/**
		 * Function to compute the delay in milliseconds before the next retry based
		 * on the number of attempts.
		 * @param attempt Current number of attempts, including the first attempt.
		 * @returns Delay in milliseconds.
		 */
		computeDelay: (attempt: number) => number;
	};
	/**
	 * Maximum number of retry attempts, starting from 1. Defaults to 3.
	 */
	maxAttempts?: number;

	/**
	 * Optional AbortSignal to abort the retry attempts.
	 */
	abortSignal?: AbortSignal;
}

/**
 * Retry middleware
 */
export const retry =
	(options: RetryOptions) =>
	(next: MiddlewareHandler<Request, Response>, context: MiddlewareContext) => {
		if (options.maxAttempts < 1) {
			throw new Error('maxAttempts must be greater than 0');
		}
		return async function retry(request: Request) {
			const {
				maxAttempts = DEFAULT_RETRY_ATTEMPTS,
				retryDecider,
				backOffStrategy,
				abortSignal,
			} = options;
			let error = undefined;
			let attemptsCount = (context[CONTEXT_KEY_RETRY_COUNT] as number) ?? 0;
			let response;
			while (!abortSignal?.aborted && attemptsCount < maxAttempts) {
				error = undefined;
				response = undefined;
				try {
					response = await next(request);
				} catch (e) {
					error = e;
				}
				if (retryDecider(response, error)) {
					attemptsCount += 1;
					if (!abortSignal?.aborted && attemptsCount < maxAttempts) {
						// prevent sleep for last attempt or cancelled request;
						const delay = backOffStrategy.computeDelay(attemptsCount);
						await cancellableSleep(delay, abortSignal);
					}
					context[CONTEXT_KEY_RETRY_COUNT] = attemptsCount;
					continue;
				} else if (response) {
					return response;
				} else {
					throw error;
				}
			}
			throw abortSignal?.aborted
				? new Error('Request aborted')
				: error ?? new Error('Retry attempts exhausted');
		};
	};

const cancellableSleep = (timeoutMs: number, abortSignal?: AbortSignal) => {
	if (abortSignal?.aborted) {
		return Promise.resolve();
	}
	let timeoutId;
	let sleepPromiseResolveFn;
	const sleepPromise = new Promise<void>(resolve => {
		sleepPromiseResolveFn = resolve;
		timeoutId = setTimeout(resolve, timeoutMs);
	});
	abortSignal?.addEventListener('abort', function cancelSleep(event) {
		clearTimeout(timeoutId);
		abortSignal?.removeEventListener('abort', cancelSleep);
		sleepPromiseResolveFn();
	});
	return sleepPromise;
};

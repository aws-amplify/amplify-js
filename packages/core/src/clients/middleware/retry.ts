import { HttpResponse } from '../types';
import {
	MiddlewareContext,
	MiddlewareHandler,
	Request,
	Response,
} from '../types/core';

const DEFAULT_RETRY_ATTEMPTS = 3;
const CONTEXT_KEY_RETRY_COUNT = 'retryCount';

/**
 * Configuration of the retry middleware
 */
export interface RetryOptions {
	retryDecider: (response: HttpResponse, error?: unknown) => boolean;
	backOffStrategy: {
		computeDelay: (attempt: number) => number;
	}; // MS to wait
	maxAttempts?: number;
	abortSignal?: AbortSignal;
}

/**
 * Retry middleware
 */
export const retry =
	<T extends Request, U extends Response>() =>
	(next: MiddlewareHandler<T, U, RetryOptions>, context: MiddlewareContext) => {
		return async function retry(request: T, options: RetryOptions) {
			const {
				maxAttempts = DEFAULT_RETRY_ATTEMPTS,
				retryDecider,
				backOffStrategy,
				abortSignal,
			} = options;
			let error = undefined;
			let retryCount = (context[CONTEXT_KEY_RETRY_COUNT] as number) ?? 0;
			let response;
			do {
				try {
					response = await next(request, options);
				} catch (e) {
					error = e;
				}
				if (retryDecider(response, error)) {
					const delay = backOffStrategy.computeDelay(retryCount);
					retryCount += 1;
					context[CONTEXT_KEY_RETRY_COUNT] = retryCount;
					await cancellableSleep(delay, abortSignal);
					continue;
				} else if (response) {
					return response;
				} else {
					throw error;
				}
			} while (retryCount < maxAttempts && !abortSignal?.aborted);
			throw new Error(`Retry attempts exhausted, ${error ?? response}`);
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

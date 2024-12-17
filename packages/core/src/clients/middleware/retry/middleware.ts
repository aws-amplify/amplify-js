// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	MiddlewareContext,
	MiddlewareHandler,
	Request,
	Response,
} from '../../types/core';

import { RetryDeciderOutput } from './types';

const DEFAULT_RETRY_ATTEMPTS = 3;

/**
 * Configuration of the retry middleware
 */
export interface RetryOptions<TResponse = Response> {
	/**
	 * Function to decide if the request should be retried.
	 *
	 * @param response Optional response of the request.
	 * @param error Optional error thrown from previous attempts.
	 * @param middlewareContext Optional context object to store data between retries.
	 * @returns True if the request should be retried.
	 */
	retryDecider(
		response?: TResponse,
		error?: unknown,
		middlewareContext?: MiddlewareContext,
	): Promise<RetryDeciderOutput>;
	/**
	 * Function to compute the delay in milliseconds before the next retry based
	 * on the number of attempts.
	 * @param attempt Current number of attempts, including the first attempt.
	 * @returns Delay in milliseconds.
	 */
	computeDelay(attempt: number): number;
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
export const retryMiddlewareFactory = <TInput = Request, TOutput = Response>({
	maxAttempts = DEFAULT_RETRY_ATTEMPTS,
	retryDecider,
	computeDelay,
	abortSignal,
}: RetryOptions<TOutput>) => {
	if (maxAttempts < 1) {
		throw new Error('maxAttempts must be greater than 0');
	}

	return (
		next: MiddlewareHandler<TInput, TOutput>,
		context: MiddlewareContext,
	) =>
		async function retryMiddleware(request: TInput) {
			let error: unknown;
			let attemptsCount: number = context.attemptsCount ?? 0;
			let response: TOutput | undefined;

			// When retry is not needed or max attempts is reached, either error or response will be set. This function handles either cases.
			const handleTerminalErrorOrResponse = () => {
				if (response) {
					addOrIncrementMetadataAttempts(response, attemptsCount);

					return response;
				} else {
					addOrIncrementMetadataAttempts(error as object, attemptsCount);
					throw error;
				}
			};

			while (!abortSignal?.aborted && attemptsCount < maxAttempts) {
				try {
					response = await next(request);
					error = undefined;
				} catch (e) {
					error = e;
					response = undefined;
				}
				// context.attemptsCount may be updated after calling next handler which may retry the request by itself.
				attemptsCount =
					(context.attemptsCount ?? 0) > attemptsCount
						? (context.attemptsCount ?? 0)
						: attemptsCount + 1;
				context.attemptsCount = attemptsCount;
				const { isCredentialsExpiredError, retryable } = await retryDecider(
					response,
					error,
					context,
				);
				if (retryable) {
					// Setting isCredentialsInvalid flag to notify signing middleware to forceRefresh credentials provider.
					context.isCredentialsExpired = !!isCredentialsExpiredError;
					if (!abortSignal?.aborted && attemptsCount < maxAttempts) {
						// prevent sleep for last attempt or cancelled request;
						const delay = computeDelay(attemptsCount);
						await cancellableSleep(delay, abortSignal);
					}
					continue;
				} else {
					return handleTerminalErrorOrResponse();
				}
			}

			if (abortSignal?.aborted) {
				throw new Error('Request aborted.');
			} else {
				return handleTerminalErrorOrResponse();
			}
		};
};

const cancellableSleep = (timeoutMs: number, abortSignal?: AbortSignal) => {
	if (abortSignal?.aborted) {
		return Promise.resolve();
	}
	let timeoutId: ReturnType<typeof setTimeout>;
	let sleepPromiseResolveFn: () => void;
	const sleepPromise = new Promise<void>(resolve => {
		sleepPromiseResolveFn = resolve;
		timeoutId = setTimeout(resolve, timeoutMs);
	});
	abortSignal?.addEventListener('abort', function cancelSleep(_) {
		clearTimeout(timeoutId);
		abortSignal?.removeEventListener('abort', cancelSleep);
		sleepPromiseResolveFn();
	});

	return sleepPromise;
};

const addOrIncrementMetadataAttempts = (
	nextHandlerOutput: Record<string, any>,
	attempts: number,
) => {
	if (Object.prototype.toString.call(nextHandlerOutput) !== '[object Object]') {
		return;
	}
	nextHandlerOutput.$metadata = {
		...(nextHandlerOutput.$metadata ?? {}),
		attempts,
	};
};

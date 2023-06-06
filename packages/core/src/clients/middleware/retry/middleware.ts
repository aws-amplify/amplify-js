// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { MetadataBearer } from '@aws-sdk/types';
import {
	MiddlewareContext,
	MiddlewareHandler,
	Request,
	Response,
} from '../../types/core';

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
	 * @returns True if the request should be retried.
	 */
	retryDecider: (response?: TResponse, error?: unknown) => Promise<boolean>;
	/**
	 * Function to compute the delay in milliseconds before the next retry based
	 * on the number of attempts.
	 * @param attempt Current number of attempts, including the first attempt.
	 * @returns Delay in milliseconds.
	 */
	computeDelay: (attempt: number) => number;
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
export const retryMiddleware = <TInput = Request, TOutput = Response>({
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
		context: MiddlewareContext
	) =>
		async function retryMiddleware(request: TInput) {
			let error: Error;
			let attemptsCount = context.attemptsCount ?? 0;
			let response: TOutput;
			while (!abortSignal?.aborted && attemptsCount < maxAttempts) {
				error = undefined;
				response = undefined;
				try {
					response = await next(request);
				} catch (e) {
					error = e;
				}
				// context.attemptsCount may be updated after calling next handler which may retry the request by itself.
				attemptsCount =
					context.attemptsCount > attemptsCount
						? context.attemptsCount
						: attemptsCount + 1;
				context.attemptsCount = attemptsCount;
				if (await retryDecider(response, error)) {
					if (!abortSignal?.aborted && attemptsCount < maxAttempts) {
						// prevent sleep for last attempt or cancelled request;
						const delay = computeDelay(attemptsCount);
						await cancellableSleep(delay, abortSignal);
					}
					continue;
				} else if (response) {
					updateMetadataAttempts(response, attemptsCount);
					return response;
				} else {
					updateMetadataAttempts(error, attemptsCount);
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

/**
 * Check if the response is a contains `$metadata` property.
 *
 * @internal Amplify internal use only
 */
export const isMetadataBearer = (
	response: unknown
): response is MetadataBearer => typeof response?.['$metadata'] === 'object';

const updateMetadataAttempts = (
	nextHandlerOutput: Object,
	attempts: number
) => {
	if (isMetadataBearer(nextHandlerOutput)) {
		nextHandlerOutput.$metadata.attempts = attempts;
	}
	nextHandlerOutput['$metadata'] = { attempts };
};

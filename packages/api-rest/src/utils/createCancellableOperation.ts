// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '@aws-amplify/core/internals/aws-client-utils';

import { CanceledError } from '../errors';
import { Operation } from '../types';

import { parseRestApiServiceError } from './serviceError';
import { logger } from './logger';

/**
 * Create a cancellable operation conforming to the internal POST API interface.
 * @internal
 */
export function createCancellableOperation(
	handler: () => Promise<HttpResponse>,
	abortController: AbortController,
	operationType: 'internal',
	timeout?: number,
): Promise<HttpResponse>;

/**
 * Create a cancellable operation conforming to the external REST API interface.
 * @internal
 */
export function createCancellableOperation(
	handler: () => Promise<HttpResponse>,
	abortController: AbortController,
	operationType: 'public',
	timeout?: number,
): Operation<HttpResponse>;

/**
 * @internal
 */
export function createCancellableOperation(
	handler: () => Promise<HttpResponse>,
	abortController: AbortController,
	operationType: 'public' | 'internal',
	timeout?: number,
): Operation<HttpResponse> | Promise<HttpResponse> {
	const abortSignal = abortController.signal;
	let abortReason: string;
	if (timeout != null) {
		if (timeout < 0) {
			throw new Error('Timeout must be a non-negative number');
		}
		setTimeout(() => {
			abortReason = 'TimeoutError';
			abortController.abort(abortReason);
		}, timeout);
	}

	const job = async () => {
		try {
			const response = await handler();

			if (response.statusCode >= 300) {
				throw await parseRestApiServiceError(response)!;
			}

			return response;
		} catch (error: any) {
			if (error.name === 'AbortError' || abortSignal?.aborted === true) {
				// Check if timeout caused the abort
				const isTimeout = abortReason && abortReason === 'TimeoutError';

				if (isTimeout) {
					const timeoutError = new Error(`Request timeout after ${timeout}ms`);
					timeoutError.name = 'TimeoutError';
					logger.debug(timeoutError);
					throw timeoutError;
				} else {
					const message = abortReason ?? abortSignal.reason;
					const canceledError = new CanceledError({
						...(message && { message }),
						underlyingError: error,
						recoverySuggestion:
							'The API request was explicitly canceled. If this is not intended, validate if you called the `cancel()` function on the API request erroneously.',
					});
					logger.debug(canceledError);
					throw canceledError;
				}
			}
			logger.debug(error);
			throw error;
		}
	};

	if (operationType === 'internal') {
		return job();
	} else {
		const cancel = (abortMessage?: string) => {
			if (abortSignal.aborted === true) {
				return;
			}
			abortController.abort(abortMessage);
			// If abort reason is not supported, set a scoped reasons instead. The reason property inside an
			// AbortSignal is a readonly property and trying to set it would throw an error.
			if (abortMessage && abortSignal.reason !== abortMessage) {
				abortReason = abortMessage;
			}
		};

		return { response: job(), cancel };
	}
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '@aws-amplify/core/internals/aws-client-utils';
import { CancelledError, RestApiError } from '../errors';
import { Operation } from '../types';
import { parseRestApiServiceError } from './serviceError';
import { logger } from './logger';

/**
 * Create a cancellable operation conforming to the internal POST API interface.
 * @internal
 */
export function createCancellableOperation(
	handler: () => Promise<HttpResponse>,
	abortController: AbortController
): Promise<HttpResponse>;

/**
 * Create a cancellable operation conforming to the external REST API interface.
 * @internal
 */
export function createCancellableOperation(
	handler: (signal: AbortSignal) => Promise<HttpResponse>
): Operation<HttpResponse>;

/**
 * @internal
 */
export function createCancellableOperation(
	handler: (signal?: AbortSignal) => Promise<HttpResponse>,
	abortController?: AbortController
): Operation<HttpResponse> | Promise<HttpResponse> {
	const isInternalPost = (
		handler: (signal?: AbortSignal) => Promise<HttpResponse>
	): handler is () => Promise<HttpResponse> => !!abortController;
	// For creating a cancellable operation for public REST APIs, we need to create an AbortController
	// internally. Whereas for internal POST APIs, we need to accept in the AbortController from the
	// callers.
	const controller = isInternalPost(handler)
		? abortController
		: new AbortController();
	const signal = controller.signal;
	const job = async () => {
		try {
			const response = await (isInternalPost(handler)
				? handler()
				: handler(signal));
			if (response.statusCode >= 300) {
				throw await parseRestApiServiceError(response)!;
			}
			return response;
		} catch (error) {
			if (error.name === 'AbortError' || signal?.aborted === true) {
				const cancelledError = new CancelledError({
					name: error.name,
					message: signal.reason ?? error.message,
					underlyingError: error,
				});
				logger.debug(error);
				throw cancelledError;
			}
			logger.debug(error);
			throw error;
		}
	};

	if (isInternalPost(handler)) {
		return job();
	} else {
		const cancel = (abortMessage?: string) => {
			if (signal?.aborted === true) {
				return;
			}
			controller?.abort(abortMessage);
			// Abort reason is not widely support enough across runtimes and and browsers, so we set it
			// if it is not already set.
			if (signal?.reason !== abortMessage) {
				// @ts-expect-error reason is a readonly property
				signal['reason'] = abortMessage;
			}
		};
		return { response: job(), cancel };
	}
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';

import { InternalPostInput, RestApiResponse } from '../../types';
import { transferHandler } from './handler';
import { createCancellableOperation } from '../../utils';

/**
 * This weak map provides functionality to cancel a request given the promise containing the `post` request.
 *
 * 1. For every GraphQL POST request, an abort controller is created and supplied to the request.
 * 2. The promise fulfilled by GraphGL POST request is then mapped to that abort controller.
 * 3. The promise is returned to the external caller.
 * 4. The caller can either wait for the promise to fulfill or call `cancel(promise)` to cancel the request.
 * 5. If `cancel(promise)` is called, then the corresponding abort controller is retrieved from the map below.
 * 6. GraphQL POST request will be rejected with the error message provided during cancel.
 * 7. Caller can check if the error is because of cancelling by calling `isCancelError(error)`.
 */
const cancelTokenMap = new WeakMap<Promise<any>, AbortController>();

/**
 * @internal
 */
export const post = (
	amplify: AmplifyClassV6,
	{ url, options, abortController }: InternalPostInput
): Promise<RestApiResponse> => {
	const controller = abortController ?? new AbortController();
	const responsePromise = createCancellableOperation(async () => {
		const response = transferHandler(
			amplify,
			{
				url,
				method: 'POST',
				...options,
				abortSignal: controller.signal,
			},
			options?.signingServiceInfo
		);
		return response;
	}, controller);

	const responseWithCleanUp = responsePromise.finally(() => {
		cancelTokenMap.delete(responseWithCleanUp);
	});
	return responseWithCleanUp;
};

/**
 * Cancels a request given the promise returned by `post`.
 * If the request is already completed, this function does nothing.
 * It MUST be used after `updateRequestToBeCancellable` is called.
 */
export const cancel = (
	promise: Promise<RestApiResponse>,
	message?: string
): boolean => {
	const controller = cancelTokenMap.get(promise);
	if (controller) {
		controller.abort(message);
		if (message && controller.signal.reason !== message) {
			// In runtimes where `AbortSignal.reason` is not supported, we track the reason ourselves.
			// @ts-expect-error reason is read-only property.
			controller.signal['reason'] = message;
		}
		return true;
	}
	return false;
};

/**
 * MUST be used to make a promise including internal `post` API call cancellable.
 */
export const updateRequestToBeCancellable = (
	promise: Promise<any>,
	controller: AbortController
) => {
	cancelTokenMap.set(promise, controller);
};

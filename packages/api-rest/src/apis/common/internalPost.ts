// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';

import { InternalPostInput, RestApiResponse } from '../../types';
import { createCancellableOperation } from '../../utils';
import { CanceledError } from '../../errors';

import { transferHandler } from './handler';

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
 *
 * REST POST handler to send GraphQL request to given endpoint. By default, it will use IAM to authorize
 * the request. In some auth modes, the IAM auth has to be disabled. Here's how to set up the request auth correctly:
 * * If auth mode is 'iam', you MUST NOT set 'authorization' header and 'x-api-key' header, since it would disable IAM
 *   auth. You MUST also set 'input.options.signingServiceInfo' option.
 *   * The including 'input.options.signingServiceInfo.service' and 'input.options.signingServiceInfo.region' are
 *     optional. If omitted, the signing service and region will be inferred from url.
 * * If auth mode is 'none', you MUST NOT set 'options.signingServiceInfo' option.
 * * If auth mode is 'apiKey', you MUST set 'x-api-key' custom header.
 * * If auth mode is 'oidc' or 'lambda' or 'userPool', you MUST set 'authorization' header.
 *
 * To make the internal post cancellable, you must also call `updateRequestToBeCancellable()` with the promise from
 * internal post call and the abort controller supplied to the internal post call.
 *
 * @param amplify the AmplifyClassV6 instance - it may be the singleton used on Web, or an instance created within
 * a context created by `runWithAmplifyServerContext`
 * @param postInput an object of {@link InternalPostInput}
 * @param postInput.url The URL that the POST request sends to
 * @param postInput.options Options of the POST request
 * @param postInput.abortController The abort controller used to cancel the POST request
 * @returns a {@link RestApiResponse}
 *
 * @throws an {@link Error} with `Network error` as the `message` when the external resource is unreachable due to one
 * of the following reasons:
 *   1. no network connection
 *   2. CORS error
 * @throws a {@link CanceledError} when the ongoing POST request get cancelled
 */
export const post = (
	amplify: AmplifyClassV6,
	{ url, options, abortController }: InternalPostInput,
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
			options?.signingServiceInfo,
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
	message?: string,
): boolean => {
	const controller = cancelTokenMap.get(promise);
	if (controller) {
		controller.abort(message);
		if (message && controller.signal.reason !== message) {
			// In runtimes where `AbortSignal.reason` is not supported, we track the reason ourselves.
			// @ts-expect-error reason is read-only property.
			controller.signal.reason = message;
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
	controller: AbortController,
) => {
	cancelTokenMap.set(promise, controller);
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';

import { InternalPostInput, RestApiResponse } from '../types';
import { transferHandler } from './handler';

const cancelTokenMap = new WeakMap<
	Promise<RestApiResponse>,
	(cancelMessage?: string) => void
>();

/**
 * @internal
 */
export const post = (
	amplify: AmplifyClassV6,
	{ url, options }: InternalPostInput
): Promise<RestApiResponse> => {
	debugger;
	const { response, cancel } = transferHandler(
		amplify,
		{
			url,
			method: 'POST',
			...options,
		},
		options?.signingServiceInfo
	);
	const responseWithCleanUp = response.finally(() => {
		cancelTokenMap.delete(responseWithCleanUp);
	});
	cancelTokenMap.set(responseWithCleanUp, cancel);
	debugger;
	return responseWithCleanUp;
};

/**
 * Cancels a request given the promise returned by `post`.
 * If the request is already completed, this function does nothing.
 */
export const cancel = (
	promise: Promise<RestApiResponse>,
	message?: string
): boolean => {
	debugger;
	const cancelFn = cancelTokenMap.get(promise);
	if (cancelFn) {
		debugger;
		cancelFn(message);
		return true;
	}
	debugger;
	return false;
};

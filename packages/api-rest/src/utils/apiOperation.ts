// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '@aws-amplify/core/lib-esm/clients';
import { CanceledError, RestApiError } from '../errors';
import { Operation } from '../types';
import { parseRestApiServiceError } from './serviceError';

/**
 * @internal
 */
export const createCancellableOperation = (
	handler: (signal: AbortSignal) => Promise<HttpResponse>
): Operation<HttpResponse> => {
	const abortController = new AbortController();
	const { signal } = abortController;
	const job = async () => {
		try {
			const response = await handler(signal);
			if (response.statusCode >= 300) {
				throw parseRestApiServiceError(response)!;
			}
			return response;
		} catch (error) {
			if (error.name === 'AbortError' && signal.aborted === true) {
				throw new CanceledError({
					name: error.name,
					message: signal.reason,
					underlyingError: error,
				});
			}
			throw new RestApiError({
				...error,
				underlyingError: error,
			});
		}
	};
	const cancel = (abortMessage?: string) => {
		abortController.abort(abortMessage);
	};
	return { response: job(), cancel };
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorParams } from '@aws-amplify/core/internals/utils';

import { RestApiError } from './RestApiError';

/**
 * Internal-only class for CanceledError.
 *
 * @internal
 */
export class CanceledError extends RestApiError {
	constructor(params: Partial<AmplifyErrorParams> = {}) {
		super({
			name: 'CanceledError',
			message: 'Request is canceled by user',
			...params,
		});

		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = CanceledError;
		Object.setPrototypeOf(this, CanceledError.prototype);
	}
}

/**
 * Check if an error is caused by user calling `cancel()` in REST API.
 *
 * @note This function works **ONLY** for errors thrown by REST API. For GraphQL APIs, use `client.isCancelError(error)`
 *   instead. `client` is generated from  `generateClient()` API from `aws-amplify/api`.
 */
export const isCancelError = (error: unknown): error is CanceledError =>
	!!error && error instanceof CanceledError;

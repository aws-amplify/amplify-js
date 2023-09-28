// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorParams } from '@aws-amplify/core/internals/utils';
import { RestApiError } from './RestApiError';

/**
 * Internal-only class for CancelledError.
 *
 * @internal
 */
export class CancelledError extends RestApiError {
	constructor(params: AmplifyErrorParams) {
		super(params);

		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = CancelledError;
		Object.setPrototypeOf(this, CancelledError.prototype);
	}
}

/**
 * Check if an error is caused by user calling `cancel()` REST API.
 */
export const isCancelError = (error: unknown): boolean =>
	!!error && error instanceof CancelledError;

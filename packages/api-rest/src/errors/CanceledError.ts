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
	constructor(params: AmplifyErrorParams) {
		super(params);

		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = CanceledError;
		Object.setPrototypeOf(this, CanceledError.prototype);
	}
}

/**
 * Check if an error is caused by user calling `cancel()` on a upload/download task. If an overwriting error is
 * supplied to `task.cancel(errorOverwrite)`, this function will return `false`.
 */
export const isCancelError = (error: unknown): boolean =>
	!!error && error instanceof CanceledError;

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyErrorParams } from '@aws-amplify/core/internals/utils';

import { StorageError } from './StorageError';

/**
 * Internal-only class for CanceledError thrown by XHR handler or multipart upload when cancellation is invoked
 * without overwriting behavior.
 *
 * @internal
 */
export class CanceledError extends StorageError {
	constructor(params: Partial<AmplifyErrorParams> = {}) {
		super({
			name: 'CanceledError',
			message: 'Upload is canceled by user',
			...params,
		});

		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = CanceledError;
		Object.setPrototypeOf(this, CanceledError.prototype);
	}
}

/**
 * Check if an error is caused by user calling `cancel()` on a upload/download task. If an overwriting error is
 * supplied to `task.cancel(errorOverwrite)`, this function will return `false`.
 * @param {unknown} error The unknown exception to be checked.
 * @returns - A boolean indicating if the error was from an upload cancellation
 */
export const isCancelError = (error: unknown): error is CanceledError =>
	!!error && error instanceof CanceledError;

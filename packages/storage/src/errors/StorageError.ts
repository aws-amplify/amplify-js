// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AmplifyError, ErrorParams, ServiceError } from '@aws-amplify/core/internals/utils';

export class StorageError extends AmplifyError {
	static fromServiceError(error: Error, statusCode: number): ServiceError {
		const storageError = new StorageError({
			name: error.name,
			message: error.message,
		});
		if (statusCode === 404) {
			storageError.recoverySuggestion =
				'Please add the object with this key to the bucket as the key is not found.';
		}
		throw storageError;
	}
	constructor(params: ErrorParams) {
		super(params);

		// TODO: Delete the following 2 lines after we change the build target to >= es2015
		this.constructor = StorageError;
		Object.setPrototypeOf(this, StorageError.prototype);
	}
}

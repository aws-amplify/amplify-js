// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ServiceError } from '@aws-amplify/core/internals/utils';

import { StorageError } from '../../../../../errors/StorageError';

/**
 * Internal-only method to create a new StorageError from a service error.
 *
 * @internal
 */
export const buildStorageServiceError = (
	error: Error,
	statusCode: number,
): ServiceError => {
	const storageError = new StorageError({
		name: error.name,
		message: error.message,
	});
	if (statusCode === 404) {
		storageError.recoverySuggestion =
			'Please add the object with this key to the bucket as the key is not found.';
	}

	return storageError;
};

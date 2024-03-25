// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOperationInputPath,
	StorageOperationInputWithPrefixPath,
} from '../../../types/inputs';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

import { STORAGE_INPUT_PATH, STORAGE_INPUT_PREFIX } from './constants';

// Local assertion function with StorageOperationInputWithPrefixPath as Input
const _isInputWithPath = (
	input: StorageOperationInputWithPrefixPath,
): input is StorageOperationInputPath => {
	return input.path !== undefined;
};

export const validateStorageOperationInputWithPrefix = (
	input: StorageOperationInputWithPrefixPath,
	identityId?: string,
) => {
	// Assert that both prefix and path are not present together
	assertValidationError(
		!('prefix' in input && 'path' in input),
		StorageValidationErrorCode.PathAndPrefixNotAllowed,
	);
	if (_isInputWithPath(input)) {
		assertValidationError(
			(input as StorageOperationInputWithPrefixPath).path !== '',
			StorageValidationErrorCode.NoPath,
		);
		const { path } = input;
		const objectKey = typeof path === 'string' ? path : path({ identityId });

		// Assert on no leading slash in the path parameter
		assertValidationError(
			!objectKey.startsWith('/'),
			StorageValidationErrorCode.InvalidStoragePathInput,
		);

		return {
			inputType: STORAGE_INPUT_PATH,
			objectKey,
		};
	} else {
		return { inputType: STORAGE_INPUT_PREFIX, objectKey: input.prefix ?? '' };
	}
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOperationInputPath,
	StorageOperationPrefixInputType,
} from '../../../types/inputs';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

import { STORAGE_INPUT_PATH, STORAGE_INPUT_PREFIX } from './constants';

// Local assertion function with StorageOperationPrefixInputType as Input
export const isInputWithPath = (
	input: StorageOperationPrefixInputType,
): input is StorageOperationInputPath => {
	return input.path !== undefined;
};

export const validateStorageInputPrefix = (
	input: StorageOperationPrefixInputType,
	identityId?: string,
) => {
	if (isInputWithPath(input)) {
		assertValidationError(
			(input as StorageOperationPrefixInputType).path !== '',
			StorageValidationErrorCode.InvalidStorageOperationInput,
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

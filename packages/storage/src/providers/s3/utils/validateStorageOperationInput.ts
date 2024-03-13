// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOperationInputType as Input,
	StorageOperationInputKey,
	StorageOperationInputPath,
	StorageOperationInputPrefix,
} from '../../../types/inputs';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

import { isInputWithPath } from './isInputWithPath';
import {
	STORAGE_INPUT_KEY,
	STORAGE_INPUT_PATH,
	STORAGE_INPUT_PREFIX,
} from './constants';

const isInputWithOptions = (input: any): input is StorageOperationInputPrefix =>
	'options' in input;

const isInputWithPrefix = (
	input: Input,
): input is StorageOperationInputPrefix => 'prefix' in input;

export const validateStorageOperationInput = (
	input: Input,
	identityId?: string,
) => {
	if (isInputWithPath(input)) {
		const { path } = input as StorageOperationInputPath;
		assertValidationError(
			!!path,
			StorageValidationErrorCode.InvalidStorageOperationInput,
		);

		return {
			inputType: STORAGE_INPUT_PATH,
			objectKey: typeof path === 'string' ? path : path({ identityId }),
		};
	} else if (
		// input contains a prefix OR
		isInputWithPrefix(input) ||
		// input does not contain a `prefix` BUT contains other elements so default to empty `objectKey`.
		// Since `Key` is also a required field in the input, this case should only be true for input
		// with no `prefix` but has other parameters like `options`.
		(!isInputWithPrefix(input) && isInputWithOptions(input))
	) {
		const { prefix } = input as StorageOperationInputPrefix;

		return { inputType: STORAGE_INPUT_PREFIX, objectKey: prefix ?? '' };
	} else {
		const { key } = input as StorageOperationInputKey;
		assertValidationError(
			!!key,
			StorageValidationErrorCode.InvalidStorageOperationInput,
		);

		return { inputType: STORAGE_INPUT_KEY, objectKey: key };
	}
};

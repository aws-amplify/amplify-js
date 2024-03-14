// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageOperationInputType as Input } from '../../../types/inputs';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { isInputWithPath } from './isInputWithPath';
import { STORAGE_INPUT_KEY, STORAGE_INPUT_PATH } from './constants';

export const validateStorageInputPrefix = (
	input: Input,
	identityId?: string,
) => {
	if (isInputWithPath(input)) {
		assertValidationError(
			(input as Input).path !== '',
			StorageValidationErrorCode.InvalidStorageOperationInput,
		);
		const { path } = input;
		const objectKey = typeof path === 'string' ? path : path({ identityId });
		assertValidationError(
			objectKey.startsWith('/'),
			StorageValidationErrorCode.InvalidStorageOperationInput,
		);

		return {
			inputType: STORAGE_INPUT_PATH,
			objectKey,
		};
	} else {
		return { inputType: STORAGE_INPUT_KEY, objectKey: input.prefix ?? '' };
	}
};

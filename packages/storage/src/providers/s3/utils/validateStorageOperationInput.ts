// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageOperationInputType as Input } from '../../../types/inputs';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

import { isInputWithPath } from './isInputWithPath';
import { STORAGE_INPUT_KEY, STORAGE_INPUT_PATH } from './constants';

export const validateStorageOperationInput = (
	input: Input,
	identityId?: string,
) => {
	assertValidationError(
		!!(input as Input).key || !!(input as Input).path,
		StorageValidationErrorCode.InvalidStorageOperationInput,
	);

	if (isInputWithPath(input)) {
		const { path } = input;

		return {
			inputType: STORAGE_INPUT_PATH,
			objectKey: typeof path === 'string' ? path : path({ identityId }),
		};
	} else {
		return { inputType: STORAGE_INPUT_KEY, objectKey: input.key };
	}
};

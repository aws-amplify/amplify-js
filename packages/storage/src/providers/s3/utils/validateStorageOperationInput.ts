// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

import {
	StorageOperationInputKey,
	StorageOperationInputPath,
} from '../../../types/inputs';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

import { STORAGE_INPUT_KEY, STORAGE_INPUT_PATH } from './constants';

type Input = StrictUnion<StorageOperationInputKey | StorageOperationInputPath>;

const isInputWithPath = (input: Input): input is StorageOperationInputPath => {
	return input.path !== undefined;
};

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

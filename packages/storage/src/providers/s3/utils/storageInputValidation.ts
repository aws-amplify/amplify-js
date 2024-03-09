// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StrictUnion } from '@aws-amplify/core/internals/utils';

import {
	StorageOperationInputKey,
	StorageOperationInputPath,
	StorageOperationInputPrefix,
} from '../../../types/inputs';

import {
	STORAGE_INPUT_KEY,
	STORAGE_INPUT_PATH,
	STORAGE_INPUT_PREFIX,
} from './constants';

type Input = StrictUnion<
	| StorageOperationInputKey
	| StorageOperationInputPath
	| StorageOperationInputPrefix
>;

const isInputWithPrefix = (
	input: Input,
): input is StorageOperationInputPrefix => {
	return input.prefix !== undefined;
};

const isInputWithKey = (input: Input): input is StorageOperationInputKey => {
	return input.key !== undefined;
};

const isInputWithPath = (input: Input): input is StorageOperationInputPath => {
	return input.path !== undefined;
};

export const validateStorageOperationInput = (
	input: Input,
	identityId?: string,
) => {
	if (isInputWithPath(input)) {
		const { path } = input;

		return {
			inputType: STORAGE_INPUT_PATH,
			objectKey: typeof path === 'string' ? path : path({ identityId }),
		};
	} else if (isInputWithKey(input)) {
		return { inputType: STORAGE_INPUT_KEY, objectKey: input.key };
	} else if (
		// input contains a prefix OR
		isInputWithPrefix(input) ||
		// input does not contain a prefix BUT contains other elements so default to empty objectKey
		(!isInputWithPrefix(input) && Object.keys(input).length !== 0)
	) {
		return { inputType: STORAGE_INPUT_PREFIX, objectKey: input.prefix ?? '' };
	} else {
		throw new Error('invalid input');
	}
};

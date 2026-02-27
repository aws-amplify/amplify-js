// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageOperationInputWithPath,
	StorageOperationInputWithPrefixPath,
} from '../../src/types/inputs';
import { assertValidationError } from '../../src/errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../src/errors/types/validation';
import { STORAGE_INPUT_PATH, STORAGE_INPUT_PREFIX } from '../utils/constants';
import { resolveIdentityId } from '../utils/resolveIdentityId';

// Local assertion function with StorageOperationInputWithPrefixPath as Input
const _isInputWithPath = (
	input: StorageOperationInputWithPrefixPath,
): input is StorageOperationInputWithPath => {
	return input.path !== undefined;
};

export const validateStorageOperationInputWithPrefix = (
	input: StorageOperationInputWithPrefixPath,
	identityId?: string,
) => {
	// Validate prefix & path not present at the same time
	assertValidationError(
		!(input.prefix && input.path),
		StorageValidationErrorCode.InvalidStorageOperationPrefixInput,
	);
	if (_isInputWithPath(input)) {
		const { path } = input;
		const objectKey =
			typeof path === 'string'
				? path
				: path({ identityId: resolveIdentityId(identityId) });

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

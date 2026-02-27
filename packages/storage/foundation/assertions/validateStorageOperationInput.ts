// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageOperationInput as Input } from '../../src/types/inputs';
import { assertValidationError } from '../../src/errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../src/errors/types/validation';
import { isInputWithPath } from '../utils/isInputWithPath';
import { STORAGE_INPUT_KEY, STORAGE_INPUT_PATH } from '../utils/constants';
import { resolveIdentityId } from '../utils/resolveIdentityId';

export const validateStorageOperationInput = (
	input: Input,
	identityId?: string,
) => {
	assertValidationError(
		// Key present without a path
		(!!(input as Input).key && !(input as Input).path) ||
			// Path present without a key
			(!(input as Input).key && !!(input as Input).path),
		StorageValidationErrorCode.InvalidStorageOperationInput,
	);

	if (isInputWithPath(input)) {
		const { path } = input;
		const objectKey =
			typeof path === 'string'
				? path
				: path({ identityId: resolveIdentityId(identityId) });

		assertValidationError(
			!objectKey.startsWith('/'),
			StorageValidationErrorCode.InvalidStoragePathInput,
		);

		return {
			inputType: STORAGE_INPUT_PATH,
			objectKey,
		};
	} else {
		return { inputType: STORAGE_INPUT_KEY, objectKey: input.key };
	}
};

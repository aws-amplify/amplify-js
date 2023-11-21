// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageValidationErrorCode,
	validationErrorMap,
} from '~/src/errors/types/validation';
import { StorageError } from '~/src/errors/StorageError';

export function assertValidationError(
	assertion: boolean,
	name: StorageValidationErrorCode,
): asserts assertion {
	const { message, recoverySuggestion } = validationErrorMap[name];

	if (!assertion) {
		throw new StorageError({ name, message, recoverySuggestion });
	}
}

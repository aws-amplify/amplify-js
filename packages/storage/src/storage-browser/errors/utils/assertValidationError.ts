// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	StorageBrowserValidationErrorCode,
	validationErrorMap,
} from '../validation';
import { StorageError } from '../../../errors/StorageError';

export function assertValidationError(
	assertion: boolean,
	name: StorageBrowserValidationErrorCode,
): asserts assertion {
	const { message, recoverySuggestion } = validationErrorMap[name];

	if (!assertion) {
		throw new StorageError({ name, message, recoverySuggestion });
	}
}

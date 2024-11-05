// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { InAppMessagingError } from './InAppMessagingError';
import {
	InAppMessagingValidationErrorCode,
	validationErrorMap,
} from './validation';

/**
 * @internal
 */
export function assertValidationError(
	assertion: boolean,
	name: InAppMessagingValidationErrorCode,
): asserts assertion {
	const { message, recoverySuggestion } = validationErrorMap[name];

	if (!assertion) {
		throw new InAppMessagingError({ name, message, recoverySuggestion });
	}
}

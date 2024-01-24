// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LoggingError } from './LoggingError';
import { LoggingValidationErrorCode, validationErrorMap } from './validation';

/**
 * @internal
 */
export function assertValidationError(
	assertion: boolean,
	name: LoggingValidationErrorCode,
	message?: string
): asserts assertion {
	const { message: defaultMessage, recoverySuggestion } =
		validationErrorMap[name];

	if (!assertion) {
		throw new LoggingError({
			name,
			message: message ?? defaultMessage,
			recoverySuggestion,
		});
	}
}

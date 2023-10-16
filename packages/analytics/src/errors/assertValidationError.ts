// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsError } from './AnalyticsError';
import { AnalyticsValidationErrorCode, validationErrorMap } from './validation';

/**
 * @internal
 */
export function assertValidationError(
	assertion: boolean,
	name: AnalyticsValidationErrorCode,
	message?: string
): asserts assertion {
	const { message: defaultMessage, recoverySuggestion } =
		validationErrorMap[name];

	if (!assertion) {
		throw new AnalyticsError({
			name,
			message: message ?? defaultMessage,
			recoverySuggestion,
		});
	}
}

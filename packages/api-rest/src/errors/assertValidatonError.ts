// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { logger } from '../utils';
import { RestApiError } from './RestApiError';
import { RestApiValidationErrorCode, validationErrorMap } from './validation';

/**
 * @internal
 */
export function assertValidationError(
	assertion: boolean,
	name: RestApiValidationErrorCode
): asserts assertion {
	const { message, recoverySuggestion } = validationErrorMap[name];

	if (!assertion) {
		const error = new RestApiError({ name, message, recoverySuggestion });
		logger.debug(error);
		throw error;
	}
}

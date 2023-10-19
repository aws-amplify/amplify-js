// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	InteractionsValidationErrorCode,
	validationErrorMap,
} from './validation';
import { InteractionsError } from './InteractionsError';

export function assertValidationError(
	assertion: boolean,
	name: InteractionsValidationErrorCode,
	message?: string
): asserts assertion {
	if (!assertion) {
		const { message: defaultMessage, recoverySuggestion } =
			validationErrorMap[name];
		throw new InteractionsError({
			name,
			message: message ?? defaultMessage,
			recoverySuggestion,
		});
	}
}

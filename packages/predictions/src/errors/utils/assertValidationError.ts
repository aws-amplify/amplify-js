// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PredictionsError } from '~/src/errors/PredictionsError';
import {
	PredictionsValidationErrorCode,
	validationErrorMap,
} from '~/src/errors/types/validation';

export function assertValidationError(
	assertion: boolean,
	name: PredictionsValidationErrorCode,
): asserts assertion {
	if (!assertion) {
		const { message, recoverySuggestion } = validationErrorMap[name];
		throw new PredictionsError({ name, message, recoverySuggestion });
	}
}

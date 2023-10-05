// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	PredictionsValidationErrorCode,
	validationErrorMap,
} from '../types/validation';
import { PredictionsError } from '../PredictionsError';

export function assertValidationError(
	assertion: boolean,
	name: PredictionsValidationErrorCode
): asserts assertion {
	const { message, recoverySuggestion } = validationErrorMap[name];

	if (!assertion) {
		throw new PredictionsError({ name, message, recoverySuggestion });
	}
}

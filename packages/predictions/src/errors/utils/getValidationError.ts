// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PredictionsError } from '../PredictionsError';
import {
	PredictionsValidationErrorCode,
	validationErrorMap,
} from '../types/validation';

export function getValidationError(
	name: PredictionsValidationErrorCode
): PredictionsError {
	const { message, recoverySuggestion } = validationErrorMap[name];
	return new PredictionsError({ name, message, recoverySuggestion });
}

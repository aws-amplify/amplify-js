// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PredictionsValidationErrorCode } from '../types/validation';
import { getValidationError } from './getValidationError';

export function assertValidationError(
	assertion: boolean,
	name: PredictionsValidationErrorCode
): asserts assertion {
	if (!assertion) {
		throw getValidationError(name);
	}
}

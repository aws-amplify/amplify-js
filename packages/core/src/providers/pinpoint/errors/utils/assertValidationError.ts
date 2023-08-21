// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	validationErrorMap,
	AnalyticsValidationErrorCode
} from '../types';
import { AnalyticsError } from '../AnalyticsError';

export function assertValidationError(
	assertion: boolean,
	name: AnalyticsValidationErrorCode
): asserts assertion {
	const { message, recoverySuggestion } = validationErrorMap[name];

	if (!assertion) {
		throw new AnalyticsError({ name, message, recoverySuggestion });
	}
}

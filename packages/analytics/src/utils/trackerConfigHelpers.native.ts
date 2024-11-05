// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsValidationErrorCode, assertValidationError } from '../errors';
import { AnalyticsConfigureAutoTrackInput } from '../types';

/**
 * Validates tracker configuration.
 */
export const validateTrackerConfiguration = (
	input: AnalyticsConfigureAutoTrackInput,
) => {
	// React Native only supports session tracking
	assertValidationError(
		input.type === 'session',
		AnalyticsValidationErrorCode.UnsupportedPlatform,
	);
};

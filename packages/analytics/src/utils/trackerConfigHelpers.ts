// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '~/src/errors';
import { AnalyticsConfigureAutoTrackInput } from '~/src/types';

/**
 * Validates tracker configuration.
 */
export const validateTrackerConfiguration = (
	input: AnalyticsConfigureAutoTrackInput,
) => {
	assertValidationError(
		input.type === 'event' ||
			input.type === 'pageView' ||
			input.type === 'session',
		AnalyticsValidationErrorCode.InvalidTracker,
	);
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';
import { DEFAULT_PERSONALIZE_CONFIG, PERSONALIZE_FLUSH_SIZE_MAX } from './';
import { FLUSH_INTERVAL_MIN } from '../../../utils/constants';

export const resolveConfig = () => {
	const config = Amplify.getConfig().Analytics?.Personalize;
	const {
		region,
		trackingId,
		flushSize = DEFAULT_PERSONALIZE_CONFIG.flushSize,
		flushInterval = DEFAULT_PERSONALIZE_CONFIG.flushInterval,
	} = {
		...DEFAULT_PERSONALIZE_CONFIG,
		...config,
	};

	assertValidationError(!!region, AnalyticsValidationErrorCode.NoRegion);
	assertValidationError(
		!!trackingId,
		AnalyticsValidationErrorCode.NoTrackingId
	);
	assertValidationError(
		flushSize <= PERSONALIZE_FLUSH_SIZE_MAX,
		AnalyticsValidationErrorCode.InvalidFlushSize,
		`FlushSize for Personalize should be less or equal than ${PERSONALIZE_FLUSH_SIZE_MAX}`
	);
	assertValidationError(
		flushInterval >= FLUSH_INTERVAL_MIN,
		AnalyticsValidationErrorCode.InvalidFlushInterval,
		`FlushInterval should be greater than or equal to ${FLUSH_INTERVAL_MIN} milliseconds`
	);

	return {
		region,
		trackingId,
		bufferSize: flushSize + 1,
		flushSize,
		flushInterval,
	};
};

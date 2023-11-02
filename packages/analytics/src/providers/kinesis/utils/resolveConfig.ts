// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';
import { DEFAULT_KINESIS_CONFIG } from './constants';
import { FLUSH_INTERVAL_MIN } from '../../../utils/constants';

export const resolveConfig = () => {
	const config = Amplify.getConfig().Analytics?.Kinesis;
	const {
		region,
		bufferSize = DEFAULT_KINESIS_CONFIG.bufferSize,
		flushSize = DEFAULT_KINESIS_CONFIG.flushSize,
		flushInterval = DEFAULT_KINESIS_CONFIG.flushInterval,
		resendLimit,
	} = {
		...DEFAULT_KINESIS_CONFIG,
		...config,
	};

	assertValidationError(!!region, AnalyticsValidationErrorCode.NoRegion);
	assertValidationError(
		flushSize < bufferSize,
		AnalyticsValidationErrorCode.InvalidFlushSize
	);
	assertValidationError(
		flushInterval >= FLUSH_INTERVAL_MIN,
		AnalyticsValidationErrorCode.InvalidFlushInterval,
		`FlushInterval should be greater than or equal to ${FLUSH_INTERVAL_MIN} milliseconds`
	);

	return {
		region,
		bufferSize,
		flushSize,
		flushInterval,
		resendLimit,
	};
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';
import { DEFAULT_KINESIS_CONFIG } from './constants';

export const resolveConfig = () => {
	const config = Amplify.getConfig().Analytics?.Kinesis;
	const { region, resendLimit } = config || {};
	const bufferSize = config?.bufferSize || DEFAULT_KINESIS_CONFIG.bufferSize;
	const flushSize = config?.flushSize || DEFAULT_KINESIS_CONFIG.flushSize;
	const flushInterval =
		config?.flushInterval || DEFAULT_KINESIS_CONFIG.flushInterval;

	assertValidationError(!!region, AnalyticsValidationErrorCode.NoRegion);
	assertValidationError(
		flushSize < bufferSize,
		AnalyticsValidationErrorCode.LargeFlushSize
	);
	return {
		region,
		bufferSize,
		flushSize,
		flushInterval,
		resendLimit,
	};
};

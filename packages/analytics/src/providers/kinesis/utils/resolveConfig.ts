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
	const { bufferSize, flushSize, flushInterval } = {
		...DEFAULT_KINESIS_CONFIG,
		...Object.fromEntries(
			Object.entries(config || {}).filter(([, value]) => value !== undefined)
		),
	};

	const resendLimit = config?.hasOwnProperty('resendLimit')
		? config?.resendLimit
		: DEFAULT_KINESIS_CONFIG.resendLimit;

	assertValidationError(
		!!config?.region,
		AnalyticsValidationErrorCode.NoRegion
	);
	assertValidationError(
		flushSize < bufferSize,
		AnalyticsValidationErrorCode.InvalidFlushSize
	);
	return {
		region: config?.region,
		bufferSize,
		flushSize,
		flushInterval,
		resendLimit,
	};
};

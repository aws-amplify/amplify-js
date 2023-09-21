// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';

export const resolveConfig = () => {
	const { bufferSize, flushSize, flushInterval, region, resendLimit } =
		Amplify.getConfig().Analytics?.AWSKinesis ?? {};
	// TODO: Do we need to validate the flushSize < bufferSize? does flushInterval has a lower bound?
	assertValidationError(!!region, AnalyticsValidationErrorCode.NoRegion);
	// TODO: replace with default value
	return {
		region,
		bufferSize: bufferSize ?? 1000,
		flushSize: flushSize ?? 100,
		flushInterval: flushInterval ?? 5000,
		resendLimit,
	};
};

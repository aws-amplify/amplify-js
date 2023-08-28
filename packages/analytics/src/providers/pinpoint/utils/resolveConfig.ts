// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';

/**
 * @internal
 */
export const resolveConfig = () => {
	const { appId, region } = Amplify.getConfig().Analytics?.Pinpoint ?? {};
	assertValidationError(!!appId, AnalyticsValidationErrorCode.NoAppId);
	assertValidationError(!!region, AnalyticsValidationErrorCode.NoRegion);
	return { appId, region };
};

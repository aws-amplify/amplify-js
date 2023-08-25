// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';

/**
 * @internal
 */
export const resolveConfig = () => {
	const { appId, region } = AmplifyV6.getConfig().Analytics?.AWSPinpoint ?? {};
	assertValidationError(!!appId, AnalyticsValidationErrorCode.NoAppId);
	assertValidationError(!!region, AnalyticsValidationErrorCode.NoRegion);
	return { appId, region };
};

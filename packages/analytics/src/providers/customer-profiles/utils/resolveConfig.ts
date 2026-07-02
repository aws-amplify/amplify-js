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
	const { endpoint, region } =
		Amplify.getConfig().Analytics?.CustomerProfiles ?? {};
	assertValidationError(!!endpoint, AnalyticsValidationErrorCode.NoEndpoint);
	assertValidationError(!!region, AnalyticsValidationErrorCode.NoRegion);

	return { endpoint, region };
};

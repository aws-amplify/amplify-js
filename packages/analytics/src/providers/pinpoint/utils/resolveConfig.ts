// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import {
	AnalyticsValidationErrorCode,
	assertValidationError,
} from '../../../errors';

/**
 * @internal
 */
export const resolveConfig = (ctx: AmplifyContext) => {
	const { appId, region, bufferSize, flushSize, flushInterval, resendLimit } =
		ctx.resourcesConfig.Analytics?.Pinpoint ?? {};
	assertValidationError(!!appId, AnalyticsValidationErrorCode.NoAppId);
	assertValidationError(!!region, AnalyticsValidationErrorCode.NoRegion);

	return { appId, region, bufferSize, flushSize, flushInterval, resendLimit };
};

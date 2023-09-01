// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { APIValidationErrorCode, assertValidationError } from './errors';

/**
 * @internal
 */
export const resolveConfig = () => {
	// TODO V6
	const { appId, region } = Amplify.getConfig().API ?? {};
	assertValidationError(!!appId, APIValidationErrorCode.NoAppId);
	assertValidationError(!!region, APIValidationErrorCode.NoRegion);
	// TODO V6
	return { appId, region };
};

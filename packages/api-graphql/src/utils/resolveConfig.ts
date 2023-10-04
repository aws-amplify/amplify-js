// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { APIValidationErrorCode, assertValidationError } from './errors';

/**
 * @internal
 */
export const resolveConfig = () => {
	const { region, defaultAuthMode, endpoint } =
		Amplify.getConfig().API?.GraphQL ?? {};
	assertValidationError(!!endpoint, APIValidationErrorCode.NoAppId);
	assertValidationError(!!region, APIValidationErrorCode.NoRegion);
	assertValidationError(
		!!defaultAuthMode,
		APIValidationErrorCode.NoDefaultAuthMode
	);
	return { endpoint, region, defaultAuthMode };
};

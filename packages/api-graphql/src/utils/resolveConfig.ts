// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { APIValidationErrorCode, assertValidationError } from './errors';

/**
 * @internal
 */
export const resolveConfig = () => {
	const { region, defaultAuthMode, endpoint } =
		Amplify.getConfig().API?.AppSync ?? {};
	assertValidationError(!!endpoint, APIValidationErrorCode.NoEndpoint);
	assertValidationError(
		!!defaultAuthMode,
		APIValidationErrorCode.NoDefaultAuthMode
	);
	assertValidationError(!!region, APIValidationErrorCode.NoRegion);
	return { endpoint, region, defaultAuthMode };
};

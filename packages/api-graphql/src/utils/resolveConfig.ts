// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { APIValidationErrorCode, assertValidationError } from './errors';

/**
 * @internal
 */
export const resolveConfig = () => {
	const {
		apiKey,
		customEndpoint,
		customEndpointRegion,
		defaultAuthMode,
		endpoint,
		region,
	} = Amplify.getConfig().API?.GraphQL ?? {};

	assertValidationError(!!endpoint, APIValidationErrorCode.NoEndpoint);
	assertValidationError(
		!(!customEndpoint && customEndpointRegion),
		APIValidationErrorCode.NoCustomEndpoint
	);

	return {
		apiKey,
		customEndpoint,
		customEndpointRegion,
		defaultAuthMode,
		endpoint,
		region,
	};
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { APIValidationErrorCode, assertValidationError } from './errors';

/**
 * @internal
 */
export const resolveConfig = (amplify: AmplifyClassV6) => {
	const {
		apiKey,
		customEndpoint,
		customEndpointRegion,
		defaultAuthMode,
		endpoint,
		region,
	} = amplify.getConfig().API?.GraphQL ?? {};

	// TODO: re-enable when working in all test environments:
	// assertValidationError(!!endpoint, APIValidationErrorCode.NoEndpoint);
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

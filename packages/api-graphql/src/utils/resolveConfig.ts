// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6, ConsoleLogger } from '@aws-amplify/core';

import { APIValidationErrorCode, assertValidationError } from './errors';

const logger = new ConsoleLogger('GraphQLAPI resolveConfig');

/**
 * @internal
 */
export const resolveConfig = (amplify: AmplifyClassV6) => {
	const config = amplify.getConfig();

	if (!config.API?.GraphQL) {
		logger.warn(
			'The API configuration is missing. This is likely due to Amplify.configure() not being called prior to generateClient().',
		);
	}

	const {
		apiKey,
		customEndpoint,
		customEndpointRegion,
		defaultAuthMode,
		endpoint,
		region,
	} = config.API?.GraphQL ?? {};

	// TODO: re-enable when working in all test environments:
	// assertValidationError(!!endpoint, APIValidationErrorCode.NoEndpoint);
	assertValidationError(
		!(!customEndpoint && customEndpointRegion),
		APIValidationErrorCode.NoCustomEndpoint,
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

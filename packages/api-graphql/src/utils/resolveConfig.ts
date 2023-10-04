// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { APIValidationErrorCode, assertValidationError } from './errors';
import { assert } from 'console';

/**
 * @internal
 */
export const resolveConfig = () => {
	const {
		region,
		defaultAuthMode,
		endpoint,
		apiKey,
		customEndpoint,
		customEndpointRegion,
	} = Amplify.getConfig().API?.GraphQL ?? {};

	/**
	 * TODO: validate that headers are a function:
	 * https://github.com/aws-amplify/amplify-js/blob/main/packages/api-graphql/src/internals/InternalGraphQLAPI.ts#L88-L93
	 * Awaiting merged PR for Amplify core config.
	 */
	assertValidationError(!!endpoint, APIValidationErrorCode.NoEndpoint);
	assertValidationError(!!region, APIValidationErrorCode.NoRegion);
	assertValidationError(
		!!defaultAuthMode,
		APIValidationErrorCode.NoDefaultAuthMode
	);
	assertValidationError(
		!(!customEndpoint && customEndpointRegion),
		APIValidationErrorCode.NoCustomEndpoint
	);

	return { endpoint, region, defaultAuthMode, apiKey };
};

/**
 * @internal
 */
export const resolveLibraryOptions = () => {
	const apiLibraryOptions = Amplify.libraryOptions?.API?.GraphQL;
	const headers = apiLibraryOptions?.headers;
	return { headers };
};

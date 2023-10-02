// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { APIValidationErrorCode, assertValidationError } from './errors';

/**
 * @internal
 */
export const resolveConfig = () => {
	const { region, defaultAuthMode, endpoint } =
<<<<<<< HEAD
		Amplify.getConfig().API?.AppSync ?? {};
	/**
	 * TODO: validate that headers are a function:
	 * https://github.com/aws-amplify/amplify-js/blob/main/packages/api-graphql/src/internals/InternalGraphQLAPI.ts#L88-L93
	 * Awaiting merged PR for Amplify core config.
	 */
	assertValidationError(!!endpoint, APIValidationErrorCode.NoEndpoint);
=======
		Amplify.getConfig().API?.GraphQL ?? {};
	assertValidationError(!!endpoint, APIValidationErrorCode.NoAppId);
	assertValidationError(!!region, APIValidationErrorCode.NoRegion);
>>>>>>> 3e1780544 (feat(api): update API config interface (#12122))
	assertValidationError(
		!!defaultAuthMode,
		APIValidationErrorCode.NoDefaultAuthMode
	);
	assertValidationError(!!region, APIValidationErrorCode.NoRegion);
	return { endpoint, region, defaultAuthMode };
};

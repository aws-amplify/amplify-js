// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import { FetchUserAttributesOutput } from '../../types';
import { fetchUserAttributes as fetchUserAttributesInternal } from '../internal/fetchUserAttributes';

/**
 * Fetches the current user attributes while authenticated.
 *
 * This is the server-side entry point. Accepts either an {@link AmplifyContext}
 * (new pattern) or a legacy {@link AmplifyServer.ContextSpec} for backward compatibility.
 *
 * @param ctxOrContextSpec - AmplifyContext or legacy ContextSpec
 * @throws GetUserException - Cognito service errors thrown when the service is not able to get the user.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export const fetchUserAttributes = (
	ctxOrContextSpec: AmplifyContext | AmplifyServer.ContextSpec,
): Promise<FetchUserAttributesOutput> => {
	const ctx =
		'resourcesConfig' in ctxOrContextSpec
			? ctxOrContextSpec
			: getAmplifyServerContext(ctxOrContextSpec).amplify;

	return fetchUserAttributesInternal(ctx as AmplifyContext);
};

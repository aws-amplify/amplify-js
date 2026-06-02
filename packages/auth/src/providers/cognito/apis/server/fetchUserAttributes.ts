// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext } from '@aws-amplify/core';

import { FetchUserAttributesOutput } from '../../types';
import { fetchUserAttributes as fetchUserAttributesInternal } from '../internal/fetchUserAttributes';

/**
 * Fetches the current user attributes while authenticated.
 *
 * This is the server-side entry point — callers must provide an explicit
 * {@link AmplifyContext} (e.g. one created per-request by the server adapter).
 *
 * @param ctx - The AmplifyContext for this request.
 * @throws GetUserException - Cognito service errors thrown when the service is not able to get the user.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export const fetchUserAttributes = (
	ctx: AmplifyContext,
): Promise<FetchUserAttributesOutput> => {
	return fetchUserAttributesInternal(ctx);
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { FetchUserAttributesOutput } from '../types';
import { GetUserException } from '../types/errors';

import { fetchUserAttributes as fetchUserAttributesInternal } from './internal/fetchUserAttributes';

/**
 * Fetches the current user attributes while authenticated.
 *
 * @throws - {@link GetUserException} - Cognito service errors thrown when the service is not able to get the user.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export const fetchUserAttributes = (): Promise<FetchUserAttributesOutput> => {
	return fetchUserAttributesInternal(Amplify);
};

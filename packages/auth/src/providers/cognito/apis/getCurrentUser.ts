// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { AuthUser } from '../../../types';
import { getCurrentUser as getCurrentUserInternal } from './internal/getCurrentUser';

/**
 * Gets the current user from the idToken.
 *
 * @param getCurrentUserRequest - The request object.
 *
 * @throws - {@link InitiateAuthException} - Thrown when the service fails to refresh the tokens.
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 *
 * @returns AuthUser
 */
export const getCurrentUser = async (): Promise<AuthUser> => {
	return getCurrentUserInternal(Amplify);
};

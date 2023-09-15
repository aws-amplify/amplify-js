// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { GetCurrentUserOutput, GetCurrentUserInput } from '../../types';
import { getCurrentUser as getCurrentUserInternal } from '../internal/getCurrentUser';

/**
 * Gets the current user from the idToken.
 *
 * @param input - The GetCurrentUserInput object.
 * @returns GetCurrentUserOutput
 * @throws - {@link InitiateAuthException} - Thrown when the service fails to refresh the tokens.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export const getCurrentUser = async (
	contextSpec: AmplifyServer.ContextSpec
): Promise<GetCurrentUserOutput> => {
	return getCurrentUserInternal(getAmplifyServerContext(contextSpec).amplify);
};

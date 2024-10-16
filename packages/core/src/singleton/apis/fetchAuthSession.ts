// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '../Amplify';
import { AuthSession, FetchAuthSessionOptions } from '../Auth/types';

import { fetchAuthSession as fetchAuthSessionInternal } from './internal/fetchAuthSession';

/**
 * Fetch the auth session including the tokens and credentials if they are available. By default it
 * does not refresh the auth tokens or credentials if they are loaded in storage already. You can force a refresh
 * with `{ forceRefresh: true }` input.
 *
 * Fetch auth session{@link https://docs.amplify.aws/gen1/react/build-a-backend/auth/manage-user-session/#retrieve-a-user-session}
 * Federate with Auth0{@link https://docs.amplify.aws/gen1/react/build-a-backend/auth/advanced-workflows/#federate-with-auth0}
 * Working with AWS service Object {@link https://docs.amplify.aws/gen1/react/build-a-backend/auth/advanced-workflows/#working-with-aws-service-objects}
 * @param options - Options configuring the fetch behavior.
 * @throws {@link AuthError} - Throws error when session information cannot be refreshed.
 * @returns Promise<AuthSession>
 */
export const fetchAuthSession = (
	options?: FetchAuthSessionOptions,
): Promise<AuthSession> => {
	return fetchAuthSessionInternal(Amplify, options);
};

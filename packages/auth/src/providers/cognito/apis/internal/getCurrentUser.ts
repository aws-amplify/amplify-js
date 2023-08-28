// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	fetchAuthSession,
} from '@aws-amplify/core/internals/utils';
import { GetCurrentUserRequest, AuthUser } from '../../../../types';
import { assertAuthTokens } from '../../utils/types';

export const getCurrentUser = async (
	amplify: AmplifyClassV6,
	getCurrentUserRequest?: GetCurrentUserRequest
): Promise<AuthUser> => {
	const authConfig = amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { tokens } = await fetchAuthSession(amplify, {
		forceRefresh: getCurrentUserRequest?.recache ?? false,
	});
	assertAuthTokens(tokens);
	const { payload } = tokens.idToken;

	return {
		username: payload['cognito:username'] as string,
		userId: payload['sub'] as string,
	};
};

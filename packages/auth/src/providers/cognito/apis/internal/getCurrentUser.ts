// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, AuthTokens } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';

import { assertAuthTokens } from '../../utils/types';
import {
	AuthUser,
	CognitoAuthSignInDetails,
	GetCurrentUserOutput,
} from '../../types';

export const getCurrentUser = async (
	amplify: AmplifyContext,
): Promise<GetCurrentUserOutput> => {
	const authConfig = amplify.resourcesConfig.Auth?.Cognito;
	assertTokenProviderConfig(authConfig);

	const tokens = await amplify.getTokens({ forceRefresh: false });

	assertAuthTokens(tokens);
	const { 'cognito:username': username, sub } = tokens.idToken?.payload ?? {};

	const authUser: AuthUser = {
		username: username as string,
		userId: sub as string,
	};
	const signInDetails = getSignInDetailsFromTokens(tokens);
	if (signInDetails) {
		authUser.signInDetails = signInDetails;
	}

	return authUser;
};

function getSignInDetailsFromTokens(
	tokens: AuthTokens & { signInDetails?: CognitoAuthSignInDetails },
): CognitoAuthSignInDetails | undefined {
	return tokens?.signInDetails;
}

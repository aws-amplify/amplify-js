// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6, AuthTokens } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { assertAuthTokens } from '../../utils/types';
import {
	CognitoAuthSignInDetails,
	CognitoAuthUser,
	GetCurrentUserOutput,
} from '../../types';

export const getCurrentUser = async (
	amplify: AmplifyClassV6
): Promise<GetCurrentUserOutput> => {
	const authConfig = amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);

	const tokens = await amplify.Auth.getTokens({ forceRefresh: false });

	assertAuthTokens(tokens);
	const { 'cognito:username': username, sub } = tokens.idToken?.payload ?? {};

	const authUser: CognitoAuthUser = {
		username: username as string,
		userId: sub as string,
	};
	if (isTokensWithSignInDetails(tokens)) {
		authUser.signInDetails = tokens.signInDetails;
	}
	return authUser;
};

function isTokensWithSignInDetails(
	tokens: Record<string, unknown>
): tokens is AuthTokens & { signInDetails: CognitoAuthSignInDetails } {
	return !!tokens && !!(tokens as any).signInDetails;
}

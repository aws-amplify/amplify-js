// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { assertTokenProviderConfig } from '@aws-amplify/core/internals/utils';
import { assertAuthTokens } from '../../utils/types';
import { AuthUser } from '../../../../types';

export const getCurrentUser = async (
	amplify: AmplifyClassV6
): Promise<AuthUser> => {
	const authConfig = amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);

	const tokens = await amplify.Auth.getTokens({ forceRefresh: false });

	assertAuthTokens(tokens);
	const { 'cognito:username': username, sub } = tokens.idToken?.payload ?? {};

	return {
		username: username as string,
		userId: sub as string,
	};
};

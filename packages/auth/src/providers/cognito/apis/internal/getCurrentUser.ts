// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	fetchAuthSession,
} from '@aws-amplify/core/internals/utils';
import { GetCurrentUserInput, GetCurrentUserOutput } from '../../types';
import { assertAuthTokens } from '../../utils/types';

export const getCurrentUser = async (
	amplify: AmplifyClassV6,
	input?: GetCurrentUserInput
): Promise<GetCurrentUserOutput> => {
	const authConfig = amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { tokens } = await fetchAuthSession(amplify, {
		forceRefresh: input?.recache ?? false,
	});
	assertAuthTokens(tokens);
	const { 'cognito:username': username, sub } = tokens.idToken?.payload ?? {};

	return {
		username: username as string,
		userId: sub as string,
	};
};

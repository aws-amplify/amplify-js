// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	assertTokenProviderConfig,
	fetchAuthSession,
} from '@aws-amplify/core/internals/utils';
import { getUser } from '../../utils/clients/CognitoIdentityProvider';
import { AuthUserAttribute } from '../../../../types';
import { getRegion } from '../../utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokens } from '../../utils/types';
import { CognitoUserAttributeKey } from '../../types';
import { toAuthUserAttribute } from '../../utils/apiHelpers';

export const fetchUserAttributes = async (
	amplify: AmplifyClassV6
): Promise<AuthUserAttribute<CognitoUserAttributeKey>> => {
	const authConfig = amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { tokens } = await fetchAuthSession(amplify, {
		forceRefresh: false,
	});
	assertAuthTokens(tokens);

	const { UserAttributes } = await getUser(
		{ region: getRegion(authConfig.userPoolId) },
		{
			AccessToken: tokens.accessToken.toString(),
		}
	);

	return toAuthUserAttribute(UserAttributes);
};

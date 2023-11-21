// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { deleteUserAttributes as deleteUserAttributesClient } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { getRegion } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokens } from '~/src/providers/cognito/utils/types';
import { DeleteUserAttributesInput } from '~/src/providers/cognito/types';
import { DeleteUserAttributesException } from '~/src/providers/cognito/types/errors';
import { getAuthUserAgentValue } from '~/src/utils';

/**
 * Deletes user attributes.
 *
 * @param input -  The DeleteUserAttributesInput object
 * @throws  -{@link DeleteUserAttributesException } - Thrown due to invalid attribute.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function deleteUserAttributes(
	input: DeleteUserAttributesInput,
): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userAttributeKeys } = input;
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	await deleteUserAttributesClient(
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.DeleteUserAttributes),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			UserAttributeNames: userAttributeKeys,
		},
	);
}

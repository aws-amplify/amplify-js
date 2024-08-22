// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { assertAuthTokens } from '../utils/types';
import { DeleteUserAttributesInput } from '../types';
import { DeleteUserAttributesException } from '../types/errors';
import { getAuthUserAgentValue } from '../../../utils';
import { createDeleteUserAttributesClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';

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
	const { userPoolEndpoint, userPoolId } = authConfig;
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	const deleteUserAttributesClient = createDeleteUserAttributesClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});
	await deleteUserAttributesClient(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.DeleteUserAttributes),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			UserAttributeNames: userAttributeKeys,
		},
	);
}

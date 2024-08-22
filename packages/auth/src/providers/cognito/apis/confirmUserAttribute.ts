// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { VerifyUserAttributeException } from '../types/errors';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { assertAuthTokens } from '../utils/types';
import { ConfirmUserAttributeInput } from '../types';
import { getAuthUserAgentValue } from '../../../utils';
import { createVerifyUserAttributeClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';

/**
 * Confirms a user attribute with the confirmation code.
 *
 * @param input -  The ConfirmUserAttributeInput object
 * @throws  -{@link AuthValidationErrorCode } -
 * Thrown when `confirmationCode` is not defined.
 * @throws  -{@link VerifyUserAttributeException } - Thrown due to an invalid confirmation code or attribute.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function confirmUserAttribute(
	input: ConfirmUserAttributeInput,
): Promise<void> {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolEndpoint, userPoolId } = authConfig;
	const { confirmationCode, userAttributeKey } = input;
	assertValidationError(
		!!confirmationCode,
		AuthValidationErrorCode.EmptyConfirmUserAttributeCode,
	);
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	const verifyUserAttribute = createVerifyUserAttributeClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});
	await verifyUserAttribute(
		{
			region: getRegionFromUserPoolId(userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmUserAttribute),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			AttributeName: userAttributeKey,
			Code: confirmationCode,
		},
	);
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, fetchAuthSession } from '@aws-amplify/core';
import {
	AuthAction,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';
import { AuthValidationErrorCode } from '~/src/errors/types/validation';
import { assertValidationError } from '~/src/errors/utils/assertValidationError';
import { verifyUserAttribute } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider';
import { VerifyUserAttributeException } from '~/src/providers/cognito/types/errors';
import { getRegion } from '~/src/providers/cognito/utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokens } from '~/src/providers/cognito/utils/types';
import { ConfirmUserAttributeInput } from '~/src/providers/cognito/types';
import { getAuthUserAgentValue } from '~/src/utils';

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
	const { confirmationCode, userAttributeKey } = input;
	assertValidationError(
		!!confirmationCode,
		AuthValidationErrorCode.EmptyConfirmUserAttributeCode,
	);
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	await verifyUserAttribute(
		{
			region: getRegion(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmUserAttribute),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			AttributeName: userAttributeKey,
			Code: confirmationCode,
		},
	);
}

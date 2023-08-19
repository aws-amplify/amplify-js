// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { ConfirmUserAttributeRequest } from '../../../types/requests';
import { verifyUserAttribute } from '../utils/clients/CognitoIdentityProvider';
import { VerifyUserAttributeException } from '../types/errors';
import {
	AmplifyV6 as Amplify,
	assertTokenProviderConfig,
} from '@aws-amplify/core';
import { fetchAuthSession } from '../../../';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';
import { assertAuthTokens } from '../utils/types';
import { CognitoUserAttributeKey } from '../types';

/**
 * Confirm the user attribute with the confirmation code.
 *
 * @param confirmUserAttributeRequest - The ConfirmUserAttributeRequest
 *
 * @throws  -{@link AuthValidationErrorCode } -
 * Thrown when `confirmationCode` is not defined.
 *
 * @throws  -{@link VerifyUserAttributeException }
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function confirmUserAttribute(
	confirmUserAttributeRequest: ConfirmUserAttributeRequest<CognitoUserAttributeKey>
): Promise<void> {
	const authConfig = Amplify.getConfig().Auth;
	assertTokenProviderConfig(authConfig);
	const { confirmationCode, userAttributeKey } = confirmUserAttributeRequest;
	assertValidationError(
		!!confirmationCode,
		AuthValidationErrorCode.EmptyConfirmUserAttributeCode
	);
	const { tokens } = await fetchAuthSession({ forceRefresh: false });
	assertAuthTokens(tokens);
	await verifyUserAttribute(
		{
			region: getRegion(authConfig.userPoolId),
		},
		{
			AccessToken: tokens.accessToken.toString(),
			AttributeName: userAttributeKey,
			Code: confirmationCode,
		}
	);
}

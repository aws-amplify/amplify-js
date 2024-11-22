// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	AuthAction,
	HubInternal,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { ConfirmSignUpInput, ConfirmSignUpOutput } from '../types';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { ConfirmSignUpException } from '../types/errors';
import { getRegionFromUserPoolId } from '../../../foundation/parsers';
import { AutoSignInEventData } from '../types/models';
import { getAuthUserAgentValue } from '../../../utils';
import { getUserContextData } from '../utils/userContextData';
import { createConfirmSignUpClient } from '../../../foundation/factories/serviceClients/cognitoIdentityProvider';
import { createCognitoUserPoolEndpointResolver } from '../factories';
import { autoSignInStore } from '../../../client/utils/store';

import { resetAutoSignIn } from './autoSignIn';

/**
 * Confirms a new user account.
 *
 * @param input -  The ConfirmSignUpInput object.
 * @returns ConfirmSignUpOutput
 * @throws -{@link ConfirmSignUpException }
 * Thrown due to an invalid confirmation code.
 * @throws -{@link AuthValidationErrorCode }
 * Thrown due to an empty confirmation code
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
export async function confirmSignUp(
	input: ConfirmSignUpInput,
): Promise<ConfirmSignUpOutput> {
	const { username, confirmationCode, options } = input;

	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	const { userPoolId, userPoolClientId, userPoolEndpoint } = authConfig;
	const clientMetadata = options?.clientMetadata;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyConfirmSignUpUsername,
	);
	assertValidationError(
		!!confirmationCode,
		AuthValidationErrorCode.EmptyConfirmSignUpCode,
	);

	const UserContextData = getUserContextData({
		username,
		userPoolId,
		userPoolClientId,
	});

	const confirmSignUpClient = createConfirmSignUpClient({
		endpointResolver: createCognitoUserPoolEndpointResolver({
			endpointOverride: userPoolEndpoint,
		}),
	});

	const { Session: session } = await confirmSignUpClient(
		{
			region: getRegionFromUserPoolId(authConfig.userPoolId),
			userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmSignUp),
		},
		{
			Username: username,
			ConfirmationCode: confirmationCode,
			ClientMetadata: clientMetadata,
			ForceAliasCreation: options?.forceAliasCreation,
			ClientId: authConfig.userPoolClientId,
			UserContextData,
		},
	);

	return new Promise((resolve, reject) => {
		try {
			const signUpOut: ConfirmSignUpOutput = {
				isSignUpComplete: true,
				nextStep: {
					signUpStep: 'DONE',
				},
			};
			const autoSignInStoreState = autoSignInStore.getState();

			if (
				!autoSignInStoreState.active ||
				autoSignInStoreState.username !== username
			) {
				resolve(signUpOut);
				resetAutoSignIn();

				return;
			}

			autoSignInStore.dispatch({ type: 'SET_SESSION', value: session });

			const stopListener = HubInternal.listen<AutoSignInEventData>(
				'auth-internal',
				({ payload }) => {
					switch (payload.event) {
						case 'autoSignIn':
							resolve({
								isSignUpComplete: true,
								nextStep: {
									signUpStep: 'COMPLETE_AUTO_SIGN_IN',
								},
							});
							stopListener();
					}
				},
			);

			HubInternal.dispatch('auth-internal', {
				event: 'confirmSignUp',
				data: signUpOut,
			});
		} catch (error) {
			reject(error);
		}
	});
}

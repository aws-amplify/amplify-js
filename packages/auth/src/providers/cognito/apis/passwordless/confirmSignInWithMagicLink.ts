// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AuthAction,
	assertTokenProviderConfig,
	base64Decoder,
} from '@aws-amplify/core/internals/utils';
import { Amplify } from '@aws-amplify/core';
import { setActiveSignInState } from '../../utils/signInStore';
import { initiateAuth } from '../../utils/clients/CognitoIdentityProvider';
import { InitiateAuthCommandInput } from '../../utils/clients/CognitoIdentityProvider/types';
import { getRegion } from '../../utils/clients/CognitoIdentityProvider/utils';
import { getAuthUserAgentValue } from '../../../../utils';
import {
	assertUserNotAuthenticated,
	setActiveSignInUsername,
} from '../../utils/signInHelpers';

/**
 * Verifies that the challenge response is a valid Magic Link URL fragment, which is
 * denoted by a period-separated string with two fragments. The first fragment is
 * a base64 encoded JSON object with the following properties:
 * - username: string
 * - iat: number
 * - exp: number
 * The second fragment is a base64 encoded string obscured to the client.
 *
 * @param challengeResponse  The code fragment from a valid Magic Link URL.
 * @returns
 */
export const isMagicLinkFragment = (challengeResponse: string) => {
	const challangeResponseFragments = challengeResponse.split('.');
	if (challangeResponseFragments.length !== 2) {
		return false;
	}
	const usernameFragment = challangeResponseFragments[0];
	const usernameFragmentJson = base64Decoder.convert(usernameFragment);
	try {
		const { username, iat, exp } = JSON.parse(usernameFragmentJson);
		return (
			typeof username === 'string' &&
			typeof iat === 'number' &&
			typeof exp === 'number'
		);
	} catch (error) {
		return false;
	}
};

/**
 * Initiate a custom auth flow to before responding to the custom challenge that asking for a Magic Link code.
 * @param challengeResponse The code fragment from a valid Magic Link URL.
 */
export const loadMagicLinkSignInState = async (challengeResponse: string) => {
	const authConfig = Amplify.getConfig().Auth?.Cognito;
	assertTokenProviderConfig(authConfig);
	await assertUserNotAuthenticated();
	const { userPoolClientId, userPoolId } = authConfig;

	const [usernameFragment] = challengeResponse.split('.');
	const usernameFragmentJson = base64Decoder.convert(usernameFragment);
	const { username } = JSON.parse(usernameFragmentJson);
	setActiveSignInUsername(username);

	const jsonReqInitiateAuth: InitiateAuthCommandInput = {
		AuthFlow: 'CUSTOM_AUTH',
		AuthParameters: {
			USERNAME: username,
		},
		ClientId: userPoolClientId,
	};

	const cognitoServiceClientConfig = {
		region: getRegion(userPoolId),
		userAgentValue: getAuthUserAgentValue(AuthAction.ConfirmSignIn),
	};

	const { Session } = await initiateAuth(
		cognitoServiceClientConfig,
		jsonReqInitiateAuth
	);

	setActiveSignInState({
		username,
		challengeName: 'CUSTOM_CHALLENGE',
		signInSession: Session,
		signInDetails: {
			loginId: username,
			authFlowType: 'CUSTOM_WITHOUT_SRP',
		},
		signInMethod: 'MAGIC_LINK',
	});
};

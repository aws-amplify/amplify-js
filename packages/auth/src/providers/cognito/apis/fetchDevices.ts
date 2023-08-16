// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6, fetchAuthSession } from '@aws-amplify/core';
import { listDevices } from '../utils/clients/CognitoIdentityProvider';
import { AuthError } from '../../../errors/AuthError';

/**
 * Signs a user in
 *
 * @param signInRequest - The SignInRequest object
 * @returns AuthSignInResult
 * @throws service:
 * @throws validation:
 *
 * TODO: add config errors
 */
export async function fetchDevices(): Promise<AuthDevice[]> {
	const session = await fetchAuthSession({});
	if (!session.tokens) {
		throw new AuthError({
			name: 'UserNotLoggedIn',
			message: 'Devices can only be fetched for authenticated users',
			recoverySuggestion:
				'Make sure to log the user in before listing the devices associated with that user',
		});
	}
	console.log('session: ', session);
	const requestParams = {
		AccessToken: session.tokens.accessToken.toString(),
		Limit: MAX_DEVICES,
	};

	const authConfig = AmplifyV6.getConfig().Auth;
	const userPoolId = authConfig?.userPoolId;
	if (!userPoolId) {
		throw new AuthError({
			name: 'AuthConfigException',
			message: 'Cannot get credentials without an userPoolId',
			recoverySuggestion:
				'Make sure a valid userPoolId is given in the config.',
		});
	}

	const region = userPoolId.split('_')[0];
	const res = await listDevices({ region }, requestParams);
	console.log('list devices res: ', res);
	return [
		{
			deviceId: '',
		},
	];
}

type AuthDevice = {
	deviceId: string;
	deviceName?: string;
};

// Cognito Documentation for max device
// tslint:disable-next-line:max-line-length
// https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ListDevices.html#API_ListDevices_RequestSyntax
const MAX_DEVICES = 60;

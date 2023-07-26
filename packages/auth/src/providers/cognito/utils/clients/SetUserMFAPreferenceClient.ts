// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	SetUserMFAPreferenceCommandInput,
	SetUserMFAPreferenceCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { AmplifyV6 } from '@aws-amplify/core';

export async function setUserMFAPreferenceClient(
	params: SetUserMFAPreferenceCommandInput
): Promise<SetUserMFAPreferenceCommandOutput> {
	const authConfig = AmplifyV6.getConfig().Auth;
	const client = new UserPoolHttpClient(authConfig);
	return client.send<SetUserMFAPreferenceCommandOutput>(
		'SetUserMFAPreference',
		params
	);
}

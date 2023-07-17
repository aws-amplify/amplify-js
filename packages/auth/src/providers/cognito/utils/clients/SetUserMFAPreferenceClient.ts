// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import type {
	SetUserMFAPreferenceCommandInput,
	SetUserMFAPreferenceCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { UserPoolHttpClient } from './HttpClients';
import { UserPoolClient } from './UserPoolClient';

export async function setUserMFAPreferenceClient(
	params: SetUserMFAPreferenceCommandInput
): Promise<SetUserMFAPreferenceCommandOutput> {
	const client = new UserPoolHttpClient(UserPoolClient.region);
	return client.send<SetUserMFAPreferenceCommandOutput>(
		'SetUserMFAPreference',
		params
	);
}

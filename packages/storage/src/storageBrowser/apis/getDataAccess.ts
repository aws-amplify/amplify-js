// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyErrorCode,
	StorageAction,
} from '@aws-amplify/core/internals/utils';

import { getStorageUserAgentValue } from '../../providers/s3/utils/userAgent';
import { getDataAccess as getDataAccessClient } from '../../providers/s3/utils/client/s3control';
import { StorageError } from '../../errors/StorageError';

import { GetDataAccessInput, GetDataAccessOutput } from './types';
import { DEFAULT_CRED_TTL } from './constants';

export const getDataAccess = async (
	input: GetDataAccessInput,
): Promise<GetDataAccessOutput> => {
	const targetType = input.scope.endsWith('*') ? undefined : 'Object';
	const { credentials } = await input.credentialsProvider();

	const result = await getDataAccessClient(
		{
			credentials,
			region: input.region,
			userAgentValue: getStorageUserAgentValue(StorageAction.GetDataAccess),
		},
		{
			AccountId: input.accountId,
			Target: input.scope,
			Permission: input.permission,
			TargetType: targetType,
			DurationSeconds: DEFAULT_CRED_TTL,
		},
	);

	const grantCredentials = result.Credentials;

	// Ensure that S3 returned credentials (this shouldn't happen)
	if (!grantCredentials) {
		throw new StorageError({
			name: AmplifyErrorCode.Unknown,
			message: 'Service did not return credentials.',
		});
	}

	const {
		AccessKeyId: accessKeyId,
		SecretAccessKey: secretAccessKey,
		SessionToken: sessionToken,
		Expiration: expiration,
	} = grantCredentials;

	return {
		credentials: {
			accessKeyId: accessKeyId!,
			secretAccessKey: secretAccessKey!,
			sessionToken,
			expiration,
		},
		scope: result.MatchedGrantTarget,
	};
};

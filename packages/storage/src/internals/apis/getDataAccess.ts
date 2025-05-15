// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyErrorCode,
	StorageAction,
} from '@aws-amplify/core/internals/utils';
import { CredentialsProviderOptions } from '@aws-amplify/core/internals/aws-client-utils';

import { getStorageUserAgentValue } from '../../providers/s3/utils/userAgent';
import { getDataAccess as getDataAccessClient } from '../../providers/s3/utils/client/s3control';
import { StorageError } from '../../errors/StorageError';
import { GetDataAccessInput } from '../types/inputs';
import { GetDataAccessOutput } from '../types/outputs';
import { logger } from '../../utils';
import { DEFAULT_CRED_TTL } from '../utils/constants';

/**
 * @internal
 */
export const getDataAccess = async (
	input: GetDataAccessInput,
): Promise<GetDataAccessOutput> => {
	const targetType = input.scope.endsWith('*') ? undefined : 'Object';
	const clientCredentialsProvider = async (
		options?: CredentialsProviderOptions,
	) => {
		const { credentials } = await input.credentialsProvider(options);

		return credentials;
	};

	const result = await getDataAccessClient(
		{
			credentials: clientCredentialsProvider,
			customEndpoint: input.customEndpoint,
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
	if (
		!grantCredentials ||
		!grantCredentials.AccessKeyId ||
		!grantCredentials.SecretAccessKey ||
		!grantCredentials.SessionToken ||
		!grantCredentials.Expiration
	) {
		throw new StorageError({
			name: AmplifyErrorCode.Unknown,
			message: 'Service did not return valid temporary credentials.',
			metadata: result.$metadata,
		});
	} else {
		logger.debug(`Retrieved credentials for: ${result.MatchedGrantTarget}`);
	}

	const {
		AccessKeyId: accessKeyId,
		SecretAccessKey: secretAccessKey,
		SessionToken: sessionToken,
		Expiration: expiration,
	} = grantCredentials;

	return {
		credentials: {
			accessKeyId,
			secretAccessKey,
			sessionToken,
			expiration,
		},
		scope: result.MatchedGrantTarget,
	};
};

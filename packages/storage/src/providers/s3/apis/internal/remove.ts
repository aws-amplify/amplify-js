// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { S3Exception } from '../../types';
import {
	StorageOperationRequest,
	StorageRemoveOptions,
	StorageRemoveResult,
} from '../../../../types';
import {
	resolveStorageConfig,
	getKeyWithPrefix,
	resolveCredentials,
} from '../../utils';
import { deleteObject, DeleteObjectInput } from '../../../../AwsClients/S3';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { AmplifyClassV6 } from '@aws-amplify/core';

// TODO(ashwinkumar6) add unit test for remove API

export const remove = async (
	amplify: AmplifyClassV6,
	req: StorageOperationRequest<StorageRemoveOptions>
): Promise<StorageRemoveResult> => {
	const { identityId, credentials } = await resolveCredentials(amplify);
	const { defaultAccessLevel, bucket, region } = resolveStorageConfig(amplify);
	const { key, options = {} } = req;
	const { accessLevel = defaultAccessLevel } = options;

	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	// TODO(ashwinkumar6) can we refactor getKeyWithPrefix to avoid duplication
	const finalKey = getKeyWithPrefix(amplify, {
		accessLevel,
		targetIdentityId:
			options.accessLevel === 'protected'
				? options.targetIdentityId
				: identityId,
		key,
	});

	// TODO(ashwinkumar6) V6-logger: debug `remove ${key} from ${finalKey}`
	await deleteObject(
		{
			region,
			credentials,
		},
		{
			Bucket: bucket,
			Key: finalKey,
		}
	);
	return {
		key,
	};
};

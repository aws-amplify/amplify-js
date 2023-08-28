// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { headObject } from '../../../../AwsClients/S3';
import { StorageOptions, StorageOperationRequest } from '../../../../types';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { S3GetPropertiesResult } from '../../types';
import {
	resolveStorageConfig,
	getKeyWithPrefix,
	resolveCredentials,
} from '../../utils';
import { AmplifyClassV6 } from '@aws-amplify/core';

export const getProperties = async function (
	amplify: AmplifyClassV6,
	req: StorageOperationRequest<StorageOptions>
): Promise<S3GetPropertiesResult> {
	const { defaultAccessLevel, bucket, region } = resolveStorageConfig(amplify);
	const { identityId, credentials } = await resolveCredentials(amplify);
	const { key, options = {} } = req;
	const { accessLevel = defaultAccessLevel } = options;

	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	// TODO[AllanZhengYP]: refactor this to reduce duplication
	const finalKey = getKeyWithPrefix(amplify, {
		accessLevel,
		targetIdentityId:
			options.accessLevel === 'protected'
				? options.targetIdentityId
				: identityId,
		key,
	});

	const response = await headObject(
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
		contentType: response.ContentType,
		size: response.ContentLength,
		eTag: response.ETag,
		lastModified: response.LastModified,
		metadata: response.Metadata,
		versionId: response.VersionId,
	};
};

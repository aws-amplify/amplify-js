// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';
import {
	GetPropertiesInput,
	GetPropertiesOutput,
} from '~/src/providers/s3/types';
import { resolveS3ConfigAndInput } from '~/src/providers/s3/utils';
import { headObject } from '~/src/providers/s3/utils/client';
import { getStorageUserAgentValue } from '~/src/providers/s3/utils/userAgent';
import { logger } from '~/src/utils';

export const getProperties = async (
	amplify: AmplifyClassV6,
	input: GetPropertiesInput,
	action?: StorageAction,
): Promise<GetPropertiesOutput> => {
	const { key, options } = input;
	const { s3Config, bucket, keyPrefix } = await resolveS3ConfigAndInput(
		amplify,
		options,
	);
	const finalKey = `${keyPrefix}${key}`;

	logger.debug(`get properties of ${key} from ${finalKey}`);
	const response = await headObject(
		{
			...s3Config,
			userAgentValue: getStorageUserAgentValue(
				action ?? StorageAction.GetProperties,
			),
		},
		{
			Bucket: bucket,
			Key: finalKey,
		},
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

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { GetPropertiesInput, GetPropertiesOutput } from '../../types';
import { resolveS3ConfigAndInput } from '../../utils';
import { headObject } from '../../utils/client';

export const getProperties = async function (
	amplify: AmplifyClassV6,
	input: GetPropertiesInput
): Promise<GetPropertiesOutput> {
	const { key, options } = input;
	const { s3Config, bucket, keyPrefix } = await resolveS3ConfigAndInput(
		amplify,
		options
	);

	const response = await headObject(s3Config, {
		Bucket: bucket,
		Key: `${keyPrefix}${key}`,
	});
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

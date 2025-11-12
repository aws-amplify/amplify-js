// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { RemoveObjectsInput, RemoveObjectsOutput } from '../../types';
import {
	calculateContentMd5,
	resolveS3ConfigAndInput,
	validateBucketOwnerID,
} from '../../utils';
import { deleteObjects } from '../../utils/client/s3data';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';

export const removeObjects = async (
	amplify: AmplifyClassV6,
	input: RemoveObjectsInput,
): Promise<RemoveObjectsOutput> => {
	// @ts-expect-error input type
	const { s3Config, bucket } = await resolveS3ConfigAndInput(amplify, input);

	validateBucketOwnerID(input.options?.expectedBucketOwner);

	if (!input.paths || input.paths.length === 0) {
		throw new Error('At least one path must be provided');
	}

	if (input.paths.length > 1000) {
		throw new Error('Cannot delete more than 1000 objects in a single request');
	}

	logger.debug(
		`removing ${input.paths.length} objects from bucket "${bucket}"`,
	);

	// Build XML body for MD5 calculation
	const objects = input.paths
		.map(path => `<Object><Key>${path}</Key></Object>`)
		.join('');
	const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<Delete xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
	<Quiet>false</Quiet>
	${objects}
</Delete>`;

	// Calculate Content-MD5 (required for DeleteObjects)
	const contentMd5 = await calculateContentMd5(xmlBody);

	const result = await deleteObjects(
		{
			...s3Config,
			userAgentValue: getStorageUserAgentValue(StorageAction.Remove),
		},
		{
			Bucket: bucket,
			Delete: {
				Objects: input.paths.map(path => ({ Key: path })),
				Quiet: false,
			},
			ExpectedBucketOwner: input.options?.expectedBucketOwner,
			ContentMD5: contentMd5,
		},
	);

	return {
		deleted: result.Deleted?.map(item => ({ path: item.Key! })) || [],
		errors:
			result.Errors?.map(error => ({
				path: error.Key!,
				code: error.Code!,
				message: error.Message!,
			})) || [],
	};
};

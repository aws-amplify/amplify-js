// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';
import { RemoveInput, RemoveOutput } from '~/src/providers/s3/types';
import { resolveS3ConfigAndInput } from '~/src/providers/s3/utils';
import { deleteObject } from '~/src/providers/s3/utils/client';
import { getStorageUserAgentValue } from '~/src/providers/s3/utils/userAgent';
import { logger } from '~/src/utils';

export const remove = async (
	amplify: AmplifyClassV6,
	input: RemoveInput,
): Promise<RemoveOutput> => {
	const { key, options = {} } = input;
	const { s3Config, keyPrefix, bucket } = await resolveS3ConfigAndInput(
		amplify,
		options,
	);

	const finalKey = `${keyPrefix}${key}`;
	logger.debug(`remove "${key}" from "${finalKey}".`);
	await deleteObject(
		{
			...s3Config,
			userAgentValue: getStorageUserAgentValue(StorageAction.Remove),
		},
		{
			Bucket: bucket,
			Key: finalKey,
		},
	);

	return {
		key,
	};
};

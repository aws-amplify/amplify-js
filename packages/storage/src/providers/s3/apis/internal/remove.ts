// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';
import { RemoveInput, RemoveOutput } from '../../types';
import { resolveS3ConfigAndInput } from '../../utils';
import { deleteObject } from '../../utils/client';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';

export const remove = async (
	amplify: AmplifyClassV6,
	input: RemoveInput
): Promise<RemoveOutput> => {
	const { key, options = {} } = input;
	const { s3Config, keyPrefix, bucket } = await resolveS3ConfigAndInput(
		amplify,
		options
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
		}
	);
	return {
		key,
	};
};

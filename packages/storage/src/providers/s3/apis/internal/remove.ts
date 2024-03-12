// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { RemoveInputKey, RemoveInputPath, RemoveOutput } from '../../types';
import {
	resolveS3ConfigAndInput,
	validateStorageOperationInput,
} from '../../utils';
import { deleteObject } from '../../utils/client';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';
import { STORAGE_INPUT_KEY } from '../../utils/constants';

export const remove = async (
	amplify: AmplifyClassV6,
	input: RemoveInputKey | RemoveInputPath,
): Promise<RemoveOutput> => {
	const { options = {} } = input ?? {};
	let path = '';
	const { s3Config, keyPrefix, bucket, identityId } =
		await resolveS3ConfigAndInput(amplify, options);

	const { inputType, objectKey } = validateStorageOperationInput(
		input,
		identityId,
	);
	path =
		inputType === STORAGE_INPUT_KEY ? `${keyPrefix}${objectKey}` : objectKey;
	logger.debug(`removing object in path "${path}"`);
	await deleteObject(
		{
			...s3Config,
			userAgentValue: getStorageUserAgentValue(StorageAction.Remove),
		},
		{
			Bucket: bucket,
			Key: path,
		},
	);

	return inputType === STORAGE_INPUT_KEY
		? {
				key: objectKey,
			}
		: {
				path,
			};
};

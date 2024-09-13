// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	RemoveInput,
	RemoveOutput,
	RemoveWithPathInput,
	RemoveWithPathOutput,
} from '../../types';
import {
	resolveS3ConfigAndInput,
	validateStorageOperationInput,
} from '../../utils';
import { createDeleteObjectClient } from '../../../../foundation/factories/serviceClients/s3';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';
import { STORAGE_INPUT_KEY } from '../../utils/constants';

export const remove = async (
	amplify: AmplifyClassV6,
	input: RemoveInput | RemoveWithPathInput,
): Promise<RemoveOutput | RemoveWithPathOutput> => {
	const { s3Config, keyPrefix, bucket, identityId } =
		await resolveS3ConfigAndInput(amplify, input);

	const { inputType, objectKey } = validateStorageOperationInput(
		input,
		identityId,
	);

	let finalKey;
	if (inputType === STORAGE_INPUT_KEY) {
		finalKey = `${keyPrefix}${objectKey}`;
		logger.debug(`remove "${objectKey}" from "${finalKey}".`);
	} else {
		finalKey = objectKey;
		logger.debug(`removing object in path "${finalKey}"`);
	}

	const deleteObject = createDeleteObjectClient();
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

	return inputType === STORAGE_INPUT_KEY
		? {
				key: objectKey,
			}
		: {
				path: objectKey,
			};
};

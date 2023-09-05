// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { RemoveRequest } from '../../../../types';
import { S3RemoveOptions, S3RemoveResult } from '../../types';
import { resolveS3ConfigAndInput } from '../../utils';
import { deleteObject } from '../../utils/client';

export const remove = async (
	amplify: AmplifyClassV6,
	removeRequest: RemoveRequest<S3RemoveOptions>
): Promise<S3RemoveResult> => {
	const { key, options = {} } = removeRequest;
	const { s3Config, keyPrefix, bucket } = await resolveS3ConfigAndInput(
		amplify,
		options
	);

	// TODO(ashwinkumar6) V6-logger: debug `remove ${key} from ${finalKey}`
	await deleteObject(s3Config, {
		Bucket: bucket,
		Key: `${keyPrefix}${key}`,
	});
	return {
		key,
	};
};

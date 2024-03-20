// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { GetUrlInput, GetUrlOutput } from '../../types';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { getPresignedGetObjectUrl } from '../../utils/client';
import {
	resolveS3ConfigAndInput,
	validateStorageOperationInput,
} from '../../utils';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import {
	DEFAULT_PRESIGN_EXPIRATION,
	MAX_URL_EXPIRATION,
	STORAGE_INPUT_KEY,
} from '../../utils/constants';

import { getProperties } from './getProperties';

export const getUrl = async (
	amplify: AmplifyClassV6,
	input: GetUrlInput,
): Promise<GetUrlOutput> => {
	const { options: getUrlOptions } = input;

	if (getUrlOptions?.validateObjectExistence) {
		if (input.key) {
			await getProperties(
				amplify,
				{ key: input.key, options: getUrlOptions },
				StorageAction.GetUrl,
			);
		} else if (input.path) {
			await getProperties(
				amplify,
				{ path: input.path, options: getUrlOptions },
				StorageAction.GetUrl,
			);
		}
	}

	const { s3Config, keyPrefix, bucket, identityId } =
		await resolveS3ConfigAndInput(amplify, getUrlOptions);
	const { inputType, objectKey } = validateStorageOperationInput(
		input,
		identityId,
	);
	const finalKey =
		inputType === STORAGE_INPUT_KEY ? keyPrefix + objectKey : objectKey;

	let urlExpirationInSec =
		getUrlOptions?.expiresIn ?? DEFAULT_PRESIGN_EXPIRATION;
	const awsCredExpiration = s3Config.credentials?.expiration;
	if (awsCredExpiration) {
		const awsCredExpirationInSec = Math.floor(
			(awsCredExpiration.getTime() - Date.now()) / 1000,
		);
		urlExpirationInSec = Math.min(awsCredExpirationInSec, urlExpirationInSec);
	}
	const maxUrlExpirationInSec = MAX_URL_EXPIRATION / 1000;
	assertValidationError(
		urlExpirationInSec <= maxUrlExpirationInSec,
		StorageValidationErrorCode.UrlExpirationMaxLimitExceed,
	);

	// expiresAt is the minimum of credential expiration and url expiration
	return {
		url: await getPresignedGetObjectUrl(
			{
				...s3Config,
				expiration: urlExpirationInSec,
			},
			{
				Bucket: bucket,
				Key: finalKey,
			},
		),
		expiresAt: new Date(Date.now() + urlExpirationInSec * 1000),
	};
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';

import { GetUrlRequest } from '../../../../types';
import { S3GetUrlOptions, S3GetUrlResult } from '../../types';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { getPresignedGetObjectUrl } from '../../utils/client';
import { getProperties } from './getProperties';
import { resolveS3ConfigAndInput } from '../../utils';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';

const DEFAULT_PRESIGN_EXPIRATION = 900;
const MAX_URL_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

export const getUrl = async function (
	amplify: AmplifyClassV6,
	getUrlRequest: GetUrlRequest<S3GetUrlOptions>
): Promise<S3GetUrlResult> {
	const { key, options } = getUrlRequest;

	if (options?.validateObjectExistence) {
		await getProperties(amplify, { key, options });
	}

	const { s3Config, keyPrefix, bucket } = await resolveS3ConfigAndInput(
		amplify,
		options
	);

	let urlExpirationInSec = options?.expiresIn ?? DEFAULT_PRESIGN_EXPIRATION;
	const awsCredExpiration = s3Config.credentials?.expiration;
	if (awsCredExpiration) {
		const awsCredExpirationInSec = Math.floor(
			(awsCredExpiration.getTime() - Date.now()) / 1000
		);
		urlExpirationInSec = Math.min(awsCredExpirationInSec, urlExpirationInSec);
	}

	assertValidationError(
		urlExpirationInSec < MAX_URL_EXPIRATION,
		StorageValidationErrorCode.UrlExpirationMaxLimitExceed
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
				Key: `${keyPrefix}${key}`,
			}
		),
		expiresAt: new Date(Date.now() + urlExpirationInSec * 1000),
	};
};

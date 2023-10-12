// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { GetUrlInput, GetUrlOutput } from '../../types';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { getPresignedGetObjectUrl } from '../../utils/client';
import { getProperties } from './getProperties';
import { resolveS3ConfigAndInput } from '../../utils';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import {
	DEFAULT_PRESIGN_EXPIRATION,
	MAX_URL_EXPIRATION,
} from '../../utils/constants';
import { StorageAction } from '@aws-amplify/core/internals/utils';

export const getUrl = async function (
	amplify: AmplifyClassV6,
	input: GetUrlInput
): Promise<GetUrlOutput> {
	const { key, options } = input;

	if (options?.validateObjectExistence) {
		await getProperties(amplify, { key, options }, StorageAction.GetUrl);
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
	const maxUrlExpirationInSec = MAX_URL_EXPIRATION / 1000;
	assertValidationError(
		urlExpirationInSec <= maxUrlExpirationInSec,
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

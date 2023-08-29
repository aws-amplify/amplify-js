// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageDownloadDataRequest } from '../../../../types';
import { S3GetUrlOptions, S3GetUrlResult } from '../../types';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { getProperties } from './getProperties';
import {
	getKeyWithPrefix,
	resolveCredentials,
	resolveStorageConfig,
} from '../../utils';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import {
	getPresignedGetObjectUrl,
	SERVICE_NAME as S3_SERVICE_NAME,
	GetObjectInput,
} from '../../utils/client';

const DEFAULT_PRESIGN_EXPIRATION = 900;
const MAX_URL_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

export const getUrl = async function (
	amplify: AmplifyClassV6,
	req: StorageDownloadDataRequest<S3GetUrlOptions>
): Promise<S3GetUrlResult> {
	const options = req?.options ?? {};
	const { credentials, identityId } = await resolveCredentials(amplify);
	const { defaultAccessLevel, bucket, region } = resolveStorageConfig(amplify);
	const { key, options: { accessLevel = defaultAccessLevel } = {} } = req;
	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	if (options?.validateObjectExistence) {
		await getProperties(amplify, { key });
	}

	// TODO[AllanZhengYP]: refactor this to reduce duplication
	const finalKey = getKeyWithPrefix(amplify, {
		accessLevel,
		targetIdentityId:
			options.accessLevel === 'protected'
				? options.targetIdentityId
				: identityId,
		key,
	});
	const getUrlParams: GetObjectInput = {
		Bucket: bucket,
		Key: finalKey,
	};
	let urlExpirationInSec = options?.expiresIn ?? DEFAULT_PRESIGN_EXPIRATION;
	const getUrlOptions = {
		accessLevel,
		credentials,
		expiration: urlExpirationInSec,
		signingRegion: region,
		region,
		signingService: S3_SERVICE_NAME,
	};
	const awsCredExpiration = credentials?.expiration;
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
		url: await getPresignedGetObjectUrl(getUrlOptions, getUrlParams),
		expiresAt: new Date(Date.now() + urlExpirationInSec * 1000),
	};
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { StorageDownloadDataRequest } from '../../../types';
import { S3GetUrlOptions, S3GetUrlResult } from '../types';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import {
	SERVICE_NAME as S3_SERVICE_NAME,
	GetObjectInput,
	getPresignedGetObjectUrl,
} from '../../../AwsClients/S3';
import { getProperties } from './getProperties';
import { S3Exception } from '../types/errors';
import {
	getKeyWithPrefix,
	resolveCredentials,
	resolveStorageConfig,
} from '../utils';
import { assertValidationError } from '../../../errors/utils/assertValidationError';

const DEFAULT_PRESIGN_EXPIRATION = 900;
const MAX_URL_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

/**
 * Get Presigned url of the object
 *
 * @param {StorageDownloadDataRequest<S3GetUrlOptions>} The request object
 * @return {Promise<S3GetUrlResult>} url of the object
 * @throws service: {@link S3Exception} - thrown when checking for existence of the object
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors
 * thrown either username or key are not defined.
 *
 * TODO: add config errors
 *
 */

export const getUrl = async function (
	req: StorageDownloadDataRequest<S3GetUrlOptions>
): Promise<S3GetUrlResult> {
	const options = req?.options ?? {};
	const { credentials, identityId } = await resolveCredentials();
	const { defaultAccessLevel, bucket, region } = resolveStorageConfig();
	const { key, options: { accessLevel = defaultAccessLevel } = {} } = req;
	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	if (options?.validateObjectExistence) {
		await getProperties({ key });
	}

	// TODO[AllanZhengYP]: refactor this to reduce duplication
	const finalKey = getKeyWithPrefix({
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
		urlExpirationInSec =
			awsCredExpirationInSec < urlExpirationInSec
				? awsCredExpirationInSec
				: urlExpirationInSec;
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

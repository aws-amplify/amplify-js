// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { S3GetUrlOptions, S3GetUrlResult } from '../types';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import {
	SERVICE_NAME as S3_SERVICE_NAME,
	GetObjectInput,
	SERVICE_NAME as S3_SERVICE_NAME,
	getPresignedGetObjectUrl,
} from '../../../AwsClients/S3';
import { getProperties } from './getProperties';
import { StorageDownloadDataRequest } from '../../../types/params';
import { GetPropertiesException } from '../types/errors';
import {
	getKeyWithPrefix,
	resolveCredentials,
	resolveStorageConfig,
} from '../utils';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
const DEFAULT_PRESIGN_EXPIRATION = 900;

/**
 * Get Presigned url of the object
 *
 * @param {StorageDownloadDataRequest<S3GetUrlOptions>} The request object
 * @return {Promise<S3GetUrlResult>} url of the object
 * @throws service: {@link GetPropertiesException} - thrown when checking for existence of the object
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown either username or key are not defined.
 *
 * TODO: add config errors
 *
 */

export const getUrl = async function (
	req: StorageDownloadDataRequest<S3GetUrlOptions>
): Promise<S3GetUrlResult> {
	const options = req?.options;
	const { credentials, identityId } = await resolveCredentials();
	const { defaultAccessLevel, bucket, region } = resolveStorageConfig();
	const { key, options: { accessLevel = defaultAccessLevel } = {} } = req;
	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	if (options?.validateObjectExistence) {
		await getProperties({ key });
	}
	const finalKey = getKeyWithPrefix(accessLevel, identityId, key);
	const getUrlParams: GetObjectInput = {
		Bucket: bucket,
		Key: finalKey,
	};
	const getUrlOptions = {
		accessLevel,
		credentials,
		expiration: options?.expiration ?? DEFAULT_PRESIGN_EXPIRATION,
		signingRegion: region,
		region,
		signingService: S3_SERVICE_NAME,
	};
	let result: S3GetUrlResult;

	result.url = new URL(
		await getPresignedGetObjectUrl(getUrlOptions, getUrlParams)
	);

	const urlExpiration = new Date(
		options?.expiration ?? DEFAULT_PRESIGN_EXPIRATION
	);
	const awsCredExpiration = credentials?.expiration;
	// expiresAt is the minimum of credential expiration and url expiration
	result.expiresAt =
		urlExpiration < awsCredExpiration ? urlExpiration : awsCredExpiration;
	return result;
};

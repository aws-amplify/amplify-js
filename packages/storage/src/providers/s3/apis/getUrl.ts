// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { S3GetUrlOptions, S3GetUrlResult } from '../types';
import { assertValidationError } from '../../../errors/assertValidationErrors';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import {
	GetObjectInput,
	getPresignedGetObjectUrl,
} from '../../../AwsClients/S3';
import { getProperties } from './getProperties';
import { StorageDownloadDataRequest } from '../../../types/params';
import { GetPropertiesException } from '../types/errors';
import { getStorageConfig, getFinalKey } from '../utils/apiHelper';

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
	const { awsCredsIdentityId, awsCreds, defaultAccessLevel, bucket, region } =
		await getStorageConfig();
	const { key, options: { accessLevel = defaultAccessLevel } = {} } = req;
	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	if (options?.validateObjectExistence) {
		await getProperties(key);
	}
	const finalKey = getFinalKey(accessLevel, awsCredsIdentityId, key);
	const getUrlParams: GetObjectInput = {
		Bucket: bucket,
		Key: finalKey,
	};
	const getUrlOptions = {
		accessLevel,
		targetIdentityId: awsCredsIdentityId,
		expiration: options?.expiration ?? DEFAULT_PRESIGN_EXPIRATION,
		credentials: awsCreds,
		signingRegion: region,
		region,
	};
	let result: S3GetUrlResult;
	result.url = await getPresignedGetObjectUrl(getUrlOptions, getUrlParams);
	const urlExpiration = new Date(
		options?.expiration ?? DEFAULT_PRESIGN_EXPIRATION
	);
	const awsCredExpiration = awsCreds?.expiration;
	// expiresAt is the minimum of credential expiration and url expiration
	result.expiresAt =
		urlExpiration < awsCredExpiration ? urlExpiration : awsCredExpiration;
	return result;
};

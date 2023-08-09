// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { S3GetUrlOptions, S3GetUrlResult } from '../types';
import { assertValidationError } from '../../../errors/assertValidationErrors';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { prefixResolver as defaultPrefixResolver } from '../../../utils/prefixResolver ';
import {
	SERVICE_NAME as S3_SERVICE_NAME,
	GetObjectInput,
	getPresignedGetObjectUrl,
} from '../../../AwsClients/S3';
import { getProperties } from './getProperties';
import { StorageDownloadDataRequest } from '../../../types/params';
import { GetPropertiesException } from '../types/errors';
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
	let result: S3GetUrlResult;
	const options = req?.options;
	// TODO extract common functionality
	const { awsCreds, awsCredsIdentityId } =
		await AmplifyV6.Auth.fetchAuthSession();
	assertValidationError(!!awsCreds, StorageValidationErrorCode.NoCredentials);
	const { bucket, region, defaultAccessLevel } = AmplifyV6.getConfig().Storage;
	assertValidationError(!!bucket, StorageValidationErrorCode.NoBucket);
	assertValidationError(!!region, StorageValidationErrorCode.NoRegion);
	const { key, options: { accessLevel = defaultAccessLevel } = {} } = req;
	const { prefixResolver = defaultPrefixResolver } =
		AmplifyV6.libraryOptions?.Storage ?? {};
	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	if (options?.validateObjectExistence) {
		await getProperties(key);
	}
	const finalKey =
		prefixResolver({
			accessLevel,
			targetIdentityId: awsCredsIdentityId,
		}) + key;
	const getUrlParams: GetObjectInput = {
		Bucket: bucket,
		Key: finalKey,
	};
	const getUrlOptions = {
		expiration: options?.expiration ?? DEFAULT_PRESIGN_EXPIRATION,
		credentials: awsCreds,
		signingRegion: region,
		signingService: S3_SERVICE_NAME,
		region: region,
	};
	const url = await getPresignedGetObjectUrl(getUrlOptions, getUrlParams);
	result.url = new URL(url);
	const urlExpiration = new Date(
		options?.expiration ?? DEFAULT_PRESIGN_EXPIRATION
	);
	const awsCredExpiration = awsCreds?.expiration;
	// expiresAt is the minimum of credential expiration and url expiration
	result.expiresAt =
		urlExpiration < awsCredExpiration ? urlExpiration : awsCredExpiration;
	return result;
};

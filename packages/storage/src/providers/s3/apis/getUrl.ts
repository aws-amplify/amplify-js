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
const DEFAULT_PRESIGN_EXPIRATION = 900;

/**
 * Get Presigned url of the object
 *
 * @param {StorageOperationRequest} The request object
 * @return {Promise<S3GetUrlResult>} url of the object
 * @throws service: {@link NotFoundException} - thrown when there is no given object in bucket
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown either username or key are not defined.
 *
 * TODO: add config errors
 *
 */

export const getUrl = async function (
	req: StorageDownloadDataRequest<S3GetUrlOptions>
): Promise<S3GetUrlResult> {
	const result: S3GetUrlResult = {
		url: undefined,
		expiresAt: undefined,
		headers: undefined,
	};
	const options = req?.options;
	AmplifyV6.getConfig().Storage;
	const { awsCreds, awsCredsIdentityId } =
		await AmplifyV6.Auth.fetchAuthSession();
	assertValidationError(!!awsCreds, StorageValidationErrorCode.NoCredentials);
	const { bucket, region, defaultAccessLevel } = AmplifyV6.getConfig().Storage;
	// TODO: assert bucket and region;
	const { key, options: { level = defaultAccessLevel } = {} } = req;
	const { prefixResolver = defaultPrefixResolver } =
		AmplifyV6.libraryOptions?.Storage ?? {};
	assertValidationError(!!key, StorageValidationErrorCode.NoKey);
	if (options?.validateObjectExistence) {
		getProperties(key);
	}
	const finalKey =
		prefixResolver({
			level,
			identityId: awsCredsIdentityId,
		}) + key;
	const params: GetObjectInput = {
		Bucket: bucket,
		Key: finalKey,
	};
	const url = await getPresignedGetObjectUrl(
		{
			expiration: options?.expiration || DEFAULT_PRESIGN_EXPIRATION,
			credentials: awsCreds,
			signingRegion: region,
			signingService: S3_SERVICE_NAME,
			region: region,
		},
		params
	);
	result.url = new URL(url);
	const urlExpiration = new Date(
		options?.expiration || DEFAULT_PRESIGN_EXPIRATION
	);
	const awsCredExpiration = awsCreds.expiration;
	// expiresAt is the minimum of credential expiration and url expiration
	result.expiresAt =
		urlExpiration < awsCredExpiration ? urlExpiration : awsCredExpiration;

	return result;
};

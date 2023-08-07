// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { StorageDownloadDataParameter } from '../../../types';
import { S3GetUrlOptions, S3GetUrlResult } from '../types';
import { assertValidationError } from '../../../errors/assertValidationErrors';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { prefixResolver as defaultPrefixResolver } from '../../../utils/prefixResolver ';
import { StorageError } from '../../../errors/StorageError';
import {
	SERVICE_NAME as S3_SERVICE_NAME,
	GetObjectInput,
	getPresignedGetObjectUrl,
} from '../../../AwsClients/S3';
import { getProperties } from './getProperties';
const DEFAULT_PRESIGN_EXPIRATION = 900;

export const getUrl = async function (
	req: StorageDownloadDataParameter<S3GetUrlOptions>
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
	try {
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
		result.expiresAt = new Date(
			Math.min(options?.expiration || DEFAULT_PRESIGN_EXPIRATION, 0)
		);
		// TODO add headers in result
	} catch (error) {
		throw new StorageError({
			name: 'KeyNotFound',
			message: 'Error retrieving the key',
		});
	}
	return result;
};

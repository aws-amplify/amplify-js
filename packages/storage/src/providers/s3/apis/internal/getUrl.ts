// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import { GetUrlInput, GetUrlOutput, GetUrlWithPathOutput } from '../../types';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import { getPresignedGetObjectUrl } from '../../utils/client/s3data';
import {
	resolveS3ConfigAndInput,
	validateBucketOwnerID,
	validateStorageOperationInput,
} from '../../utils';
import { assertValidationError } from '../../../../errors/utils/assertValidationError';
import {
	DEFAULT_PRESIGN_EXPIRATION,
	MAX_URL_EXPIRATION,
	STORAGE_INPUT_KEY,
} from '../../utils/constants';
import { constructContentDisposition } from '../../utils/constructContentDisposition';
// TODO: Remove this interface when we move to public advanced APIs.
import { GetUrlInput as GetUrlWithPathInputWithAdvancedOptions } from '../../../../internals';

import { getProperties } from './getProperties';

export const getUrl = async (
	amplify: AmplifyClassV6,
	input: GetUrlInput | GetUrlWithPathInputWithAdvancedOptions,
): Promise<GetUrlOutput | GetUrlWithPathOutput> => {
	const { options: getUrlOptions } = input;
	const { s3Config, keyPrefix, bucket, identityId } =
		await resolveS3ConfigAndInput(amplify, input);
	const { inputType, objectKey } = validateStorageOperationInput(
		input,
		identityId,
	);
	validateBucketOwnerID(getUrlOptions?.expectedBucketOwner);

	const finalKey =
		inputType === STORAGE_INPUT_KEY ? keyPrefix + objectKey : objectKey;

	if (getUrlOptions?.validateObjectExistence) {
		await getProperties(amplify, input, StorageAction.GetUrl);
	}

	let urlExpirationInSec =
		getUrlOptions?.expiresIn ?? DEFAULT_PRESIGN_EXPIRATION;
	const resolvedCredential =
		typeof s3Config.credentials === 'function'
			? await s3Config.credentials()
			: s3Config.credentials;
	const awsCredExpiration = resolvedCredential.expiration;
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
				credentials: resolvedCredential,
				expiration: urlExpirationInSec,
			},
			{
				Bucket: bucket,
				Key: finalKey,
				...(getUrlOptions?.contentDisposition && {
					ResponseContentDisposition: constructContentDisposition(
						getUrlOptions.contentDisposition,
					),
				}),
				...(getUrlOptions?.contentType && {
					ResponseContentType: getUrlOptions.contentType,
				}),
				ExpectedBucketOwner: getUrlOptions?.expectedBucketOwner,
			},
		),
		expiresAt: new Date(Date.now() + urlExpirationInSec * 1000),
	};
};

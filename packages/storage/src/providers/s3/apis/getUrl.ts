// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { StorageDownloadDataRequest } from '../../../types';
import { S3GetUrlOptions, S3GetUrlResult } from '../types';
import { getUrl as getUrlInternal } from './internal/getUrl';

/**
 * Get a preSigned and temporary URL from your S3 bucket. The result has the expiration at which url expires
 *
 * @param {StorageDownloadDataRequest<S3GetUrlOptions>} The request object
 * @return {Promise<S3GetUrlResult>} url of the object
 * @throws service: {@link S3Exception} - thrown when checking for existence of the object
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors
 * thrown either username or key are not defined.
 *
 */
export const getUrl = (
	req: StorageDownloadDataRequest<S3GetUrlOptions>
): Promise<S3GetUrlResult> => {
	return getUrlInternal(Amplify, req);
};

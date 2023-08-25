// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { StorageDownloadDataRequest } from '../../..';
import { S3GetUrlOptions, S3GetUrlResult } from '../types';
import { getUrl as getUrlInternal } from './internal/getUrl';

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
export const getUrl = (
	req: StorageDownloadDataRequest<S3GetUrlOptions>
): Promise<S3GetUrlResult> => {
	return getUrlInternal(Amplify, req);
};

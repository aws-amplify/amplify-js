// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {} from '../../../types';
import { GetUrlInput, GetUrlOutput } from '../types';
import { getUrl as getUrlInternal } from './internal/getUrl';

/**
 * Get Presigned url of the object
 *
 * @param {GetUrlInput} The input object
 * @return {Promise<GetUrlOutput>} url of the object
 * @throws service: {@link S3Exception} - thrown when checking for existence of the object
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors
 * thrown either username or key are not defined.
 *
 * TODO: add config errors
 *
 */
export const getUrl = (input: GetUrlInput): Promise<GetUrlOutput> => {
	return getUrlInternal(Amplify, input);
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { StorageOperationRequest, StorageOptions } from '../../..';
import { S3GetPropertiesResult } from '../types';
import { getProperties as getPropertiesInternal } from './internal/getProperties';

/**
 * Gets the properties of a file. The properties include S3 system metadata and
 * the user metadata that was provided when uploading the file.
 *
 * @param {StorageOperationRequest} req The request to make an API call.
 * @returns {Promise<S3GetPropertiesResult>} A promise that resolves the properties.
 * @throws A {@link S3Exception} when the underlying S3 service returned error.
 * @throws A {@link StorageValidationErrorCode} when API call parameters are invalid.
 */
export const getProperties = (
	req: StorageOperationRequest<StorageOptions>
): Promise<S3GetPropertiesResult> => {
	return getPropertiesInternal(AmplifyV6, req);
};

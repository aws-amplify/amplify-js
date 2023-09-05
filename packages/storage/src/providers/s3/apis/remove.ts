// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { RemoveRequest } from '../../../types';
import { S3RemoveOptions, S3RemoveResult } from '../types';
import { remove as removeInternal } from './internal/remove';

/**
 * Remove the object that is specified by the `req`.
 * @param {RemoveRequest<S3RemoveOptions>} removeRequest - The request object
 * @return {Promise<S3RemoveResult>} - Promise resolves upon successful removal of the object
 * @throws service: {@link S3Exception} - S3 service errors thrown while getting properties
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
 */
export const remove = (
	removeRequest: RemoveRequest<S3RemoveOptions>
): Promise<S3RemoveResult> => {
	return removeInternal(Amplify, removeRequest);
};

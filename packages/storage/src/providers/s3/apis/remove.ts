// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import {
	StorageOperationRequest,
	StorageRemoveOptions,
	StorageRemoveResult,
} from '../../..';
import { remove as removeInternal } from './internal/remove';

/**
 * Remove the object that is specified by the `req`.
 * @param {StorageOperationRequest<StorageRemoveOptions>} req - The request object
 * @return {Promise<StorageRemoveResult>} - Promise resolves upon successful removal of the object
 * @throws service: {@link S3Exception} - S3 service errors thrown while getting properties
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
 */
export const remove = (
	req: StorageOperationRequest<StorageRemoveOptions>
): Promise<StorageRemoveResult> => {
	return removeInternal(Amplify, req);
};

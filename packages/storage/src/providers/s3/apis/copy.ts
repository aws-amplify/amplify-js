// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { CopyRequest } from '../../../types';
import { S3CopyResult } from '../types';
import { copy as copyInternal } from './internal/copy';

/**
 * Copy an object from a source object to a new object within the same bucket. Can optionally copy files across
 * different level or identityId (if source object's level is 'protected').
 *
 * @async
 * @param {CopyRequest} copyRequest - The request object.
 * @return {Promise<S3CopyResult>} Promise resolves upon successful copy of the object.
 * @throws service: {@link S3Exception} - Thrown when checking for existence of the object
 * @throws validation: {@link StorageValidationErrorCode } - Thrown when
 * source or destination key are not defined.
 */
export const copy = async (copyRequest: CopyRequest): Promise<S3CopyResult> => {
	return copyInternal(Amplify, copyRequest);
};

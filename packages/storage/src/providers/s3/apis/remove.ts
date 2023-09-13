// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { RemoveInput, RemoveOutput } from '../types';
import { remove as removeInternal } from './internal/remove';

/**
 * Remove a file from your S3 bucket.
 * @param {RemoveInput} The input object
 * @return {Promise<RemoveOutput>} - Promise resolves upon successful removal of the object
 * @throws service: {@link S3Exception} - S3 service errors thrown while getting properties
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
 */
export const remove = (input: RemoveInput): Promise<RemoveOutput> => {
	return removeInternal(Amplify, input);
};

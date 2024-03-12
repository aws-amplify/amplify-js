// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	RemoveInputKey,
	RemoveInputPath,
	RemoveOutput,
	S3Exception,
} from '../types';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

import { remove as removeInternal } from './internal/remove';

interface RemoveApi {
	/**
	 * Remove a file from your S3 bucket.
	 * @param input - The RemoveInputKey object.
	 * @return Output containing the removed object key
	 * @throws service: {@link S3Exception} - S3 service errors thrown while getting properties
	 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
	 */
	(input: RemoveInputKey): Promise<RemoveOutput>;
	/**
	 * Remove a file from your S3 bucket.
	 * @param input - The RemoveInputPath object.
	 * @return Output containing the removed object path
	 * @throws service: {@link S3Exception} - S3 service errors thrown while getting properties
	 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
	 */
	(input: RemoveInputPath): Promise<RemoveOutput>;
}

// TODO(Samaritan1011001): return type should show only key or path
export const remove: RemoveApi = (
	input: RemoveInputKey | RemoveInputPath,
): Promise<RemoveOutput> => {
	return removeInternal(Amplify, input);
};

remove({ key: '' });

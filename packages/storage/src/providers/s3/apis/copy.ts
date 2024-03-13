// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	CopyInput,
	CopyInputKey,
	CopyInputPath,
	CopyOutput,
	CopyOutputKey,
	CopyOutputPath,
} from '../types';

import { copy as copyInternal } from './internal/copy';

interface Copy {
	/**
	 * Copy an object from a source object to a new object within the same bucket.
	 *
	 * @param input - The CopyInputPath object.
	 * @returns Output containing the destination object path.
	 * @throws service: `S3Exception` - Thrown when checking for existence of the object
	 * @throws validation: `StorageValidationErrorCode` - Thrown when
	 * source or destination path is not defined.
	 */
	(input: CopyInputPath): Promise<CopyOutputPath>;
	/**
	 * @deprecated The `key` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/copy | path} instead.
	 *
	 * Copy an object from a source object to a new object within the same bucket. Can optionally copy files across
	 * different level or identityId (if source object's level is 'protected').
	 *
	 * @param input - The CopyInputKey object.
	 * @returns Output containing the destination object key.
	 * @throws service: `S3Exception` - Thrown when checking for existence of the object
	 * @throws validation: `StorageValidationErrorCode` - Thrown when
	 * source or destination key is not defined.
	 */
	(input: CopyInputKey): Promise<CopyOutputKey>;
}

export const copy: Copy = <Output extends CopyOutput>(
	input: CopyInput,
): Promise<Output> => copyInternal(Amplify, input) as Promise<Output>;

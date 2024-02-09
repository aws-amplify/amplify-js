// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';
import { CopyInput, CopyOutput, S3Exception } from '../types';
import { copy as copyInternal } from './internal/copy';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

/**
 * Copy an object from a source object to a new object within the same bucket. Can optionally copy files across
 * different level or identityId (if source object's level is 'protected').
 *
 * @param input - The CopyInput object.
 * @returns Output containing the destination key.
 * @throws service: {@link S3Exception} - Thrown when checking for existence of the object
 * @throws validation: {@link StorageValidationErrorCode } - Thrown when
 * source or destination key are not defined.
 */
export const copy = async (input: CopyInput): Promise<CopyOutput> => {
	return copyInternal(Amplify, input);
};

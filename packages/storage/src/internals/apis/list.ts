// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { list as listInternal } from '../../providers/s3/apis/internal/list';
import { ListWithPathInputAndAdvancedOptions } from '../types/inputs';

/**
 * @internal
 * List all or paginate files from S3 for a given `path`.
 * @param input - The `ListWithPathInputAndAdvancedOptions` object.
 * @returns A list of all objects with path and metadata
 * @throws service: `S3Exception` - S3 service errors thrown when checking for existence of bucket
 * @throws validation: `StorageValidationErrorCode`  - thrown when there are issues with credentials
 */
export function list(input?: ListWithPathInputAndAdvancedOptions) {
	return listInternal(Amplify, input ?? {});
}

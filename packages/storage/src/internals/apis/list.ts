// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { list as listInternal } from '../../providers/s3/apis/internal/list';
import { ListAllInput, ListPaginateInput } from '../types/inputs';
import { ListAllOutput, ListPaginateOutput } from '../types/outputs';

/**
 * @internal
 * List all or paginate files from S3 for a given `path`.
 * @param input - The `ListWithPathInputAndAdvancedOptions` object.
 * @returns A list of all objects with path and metadata
 * @throws service: `S3Exception` - S3 service errors thrown when checking for existence of bucket
 * @throws validation: `StorageValidationErrorCode`  - thrown when there are issues with credentials
 */
export function list(input?: ListPaginateInput | ListAllInput) {
	if (!input) return listInternal(Amplify, {});
	if (isListAllInputWithPath(input))
		return listInternal(Amplify, {
			path: input.path,
			options: {
				bucket: input.options?.bucket,
				subpathStrategy: input.options?.subpathStrategy,
				useAccelerateEndpoint: input.options?.useAccelerateEndpoint,
				listAll: input.options?.listAll,

				// Advanced options
				locationCredentialsProvider: input.options?.locationCredentialsProvider,
			},
			// Type casting is necessary because `copyInternal` supports both Gen1 and Gen2 signatures, but here
			// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
		} as ListAllInput) as Promise<ListAllOutput>;

	return listInternal(Amplify, {
		path: input.path,
		options: {
			bucket: input.options?.bucket,
			subpathStrategy: input.options?.subpathStrategy,
			useAccelerateEndpoint: input.options?.useAccelerateEndpoint,
			listAll: input.options?.listAll,

			// Pagination options
			nextToken: input.options?.nextToken,
			pageSize: input.options?.pageSize,

			// Advanced options
			locationCredentialsProvider: input.options?.locationCredentialsProvider,
		},
		// Type casting is necessary because `copyInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	} as ListPaginateInput) as Promise<ListPaginateOutput>;
}

function isListAllInputWithPath(
	input?: ListPaginateInput | ListAllInput,
): input is ListAllInput {
	return !!input;
}

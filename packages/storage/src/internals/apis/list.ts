// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { list as listInternal } from '../../providers/s3/apis/internal/list';
import { ListInput } from '../types/inputs';
import { ListPaginateWithPathInput } from '../../providers/s3';
import { ListOutput } from '../types/outputs';

/**
 * @internal
 */
export function list(input: ListInput): Promise<ListOutput> {
	return listInternal(Amplify, {
		path: input.path,
		options: {
			bucket: input.options?.bucket,
			subpathStrategy: input.options?.subpathStrategy,
			useAccelerateEndpoint: input.options?.useAccelerateEndpoint,
			listAll: input.options?.listAll,

			// Pagination options
			nextToken: (input as ListPaginateWithPathInput).options?.nextToken,
			pageSize: (input as ListPaginateWithPathInput).options?.pageSize,
			// Advanced options
			locationCredentialsProvider: input.options?.locationCredentialsProvider,
		},
		// Type casting is necessary because `listInternal` supports both Gen1 and Gen2 signatures, but here
		// given in input can only be Gen2 signature, the return can only ben Gen2 signature.
	} as ListInput) as Promise<ListOutput>;
}

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	ListAllInput,
	ListAllOutput,
	ListAllWithPathInput,
	ListAllWithPathOutput,
	ListPaginateInput,
	ListPaginateOutput,
	ListPaginateWithPathInput,
	ListPaginateWithPathOutput,
} from '../../types';
import { list as listInternal } from '../internal/list';

/**
 * List files in pages with the given `path`.
 * `pageSize` is defaulted to 1000. Additionally, the result will include a `nextToken` if there are more items to retrieve.
 * @param input - The `ListPaginateWithPathInput` object.
 * @param contextSpec - The context spec used to get the Amplify server context.
 * @returns A list of objects with path and metadata
 * @throws service: `S3Exception` - S3 service errors thrown when checking for existence of bucket
 * @throws validation: `StorageValidationErrorCode` - thrown when there are issues with credentials
 */
export function list(
	contextSpec: AmplifyServer.ContextSpec,
	input: ListPaginateWithPathInput,
): Promise<ListPaginateWithPathOutput>;
/**
 * List all files from S3 for a given `path`. You can set `listAll` to true in `options` to get all the files from S3.
 * @param input - The `ListAllWithPathInput` object.
 * @param contextSpec - The context spec used to get the Amplify server context.
 * @returns A list of all objects with path and metadata
 * @throws service: `S3Exception` - S3 service errors thrown when checking for existence of bucket
 * @throws validation: `StorageValidationErrorCode`  - thrown when there are issues with credentials
 */
export function list(
	contextSpec: AmplifyServer.ContextSpec,
	input: ListAllWithPathInput,
): Promise<ListAllWithPathOutput>;
/**
 * @deprecated The `prefix` and `accessLevel` parameters are deprecated and may be removed in the next major version.
 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/list | path} instead.
 * List files in pages with the given `prefix`.
 * `pageSize` is defaulted to 1000. Additionally, the result will include a `nextToken` if there are more items to retrieve.
 * @param input - The `ListPaginateInput` object.
 * @returns A list of objects with key and metadata
 * @throws service: `S3Exception` - S3 service errors thrown when checking for existence of bucket
 * @throws validation: `StorageValidationErrorCode` - thrown when there are issues with credentials
 */
export function list(
	contextSpec: AmplifyServer.ContextSpec,
	input?: ListPaginateInput,
): Promise<ListPaginateOutput>;
/**
 * @deprecated The `prefix` and `accessLevel` parameters are deprecated and may be removed in the next major version.
 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/list | path} instead.
 * List all files from S3 for a given `prefix`. You can set `listAll` to true in `options` to get all the files from S3.
 * @param input - The `ListAllInput` object.
 * @returns A list of all objects with key and metadata
 * @throws service: `S3Exception` - S3 service errors thrown when checking for existence of bucket
 * @throws validation: `StorageValidationErrorCode`  - thrown when there are issues with credentials
 */
export function list(
	contextSpec: AmplifyServer.ContextSpec,
	input?: ListAllInput,
): Promise<ListAllOutput>;

export function list(
	contextSpec: AmplifyServer.ContextSpec,
	input?:
		| ListAllInput
		| ListPaginateInput
		| ListAllWithPathInput
		| ListPaginateWithPathInput,
) {
	return listInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input ?? {},
	);
}

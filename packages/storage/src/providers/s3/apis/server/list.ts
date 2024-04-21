// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	ListAllInput,
	ListAllInputWithPath,
	ListAllOutput,
	ListAllOutputWithPath,
	ListPaginateInput,
	ListPaginateInputWithPath,
	ListPaginateOutput,
	ListPaginateOutputWithPath,
} from '../../types';
import { list as listInternal } from '../internal/list';

/**
 * List files in pages with the given `path`.
 * `pageSize` is defaulted to 1000. Additionally, the result will include a `nextToken` if there are more items to retrieve.
 * @param input - The `ListPaginateInputWithPath` object.
 * @param contextSpec - The context spec used to get the Amplify server context.
 * @returns A list of objects with path and metadata
 * @throws service: `S3Exception` - S3 service errors thrown when checking for existence of bucket
 * @throws validation: `StorageValidationErrorCode` - thrown when there are issues with credentials
 */
export function list(
	contextSpec: AmplifyServer.ContextSpec,
	input: ListPaginateInputWithPath,
): Promise<ListPaginateOutputWithPath>;
/**
 * List all files from S3 for a given `path`. You can set `listAll` to true in `options` to get all the files from S3.
 * @param input - The `ListAllInputWithPath` object.
 * @param contextSpec - The context spec used to get the Amplify server context.
 * @returns A list of all objects with path and metadata
 * @throws service: `S3Exception` - S3 service errors thrown when checking for existence of bucket
 * @throws validation: `StorageValidationErrorCode`  - thrown when there are issues with credentials
 */
export function list(
	contextSpec: AmplifyServer.ContextSpec,
	input: ListAllInputWithPath,
): Promise<ListAllOutputWithPath>;
/**
 * @deprecated The `prefix` and `accessLevel` parameters are deprecated and may be removed in the next major version.
 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/list | path} instead.
 * List files in pages with the given `prefix`.
 * `pageSize` is defaulted to 1000. Additionally, the result will include a `nextToken` if there are more items to retrieve.
 * @param input - The `ListPaginateInputWithPrefix` object.
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
 * @param input - The `ListAllInputWithPrefix` object.
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
		| ListAllInputWithPath
		| ListPaginateInputWithPath,
) {
	return listInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input ?? {},
	);
}

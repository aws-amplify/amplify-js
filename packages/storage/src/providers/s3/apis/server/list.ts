// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	ListAllInput,
	ListAllInputPath,
	ListAllInputPrefix,
	ListAllOutput,
	ListAllOutputPath,
	ListAllOutputPrefix,
	ListPaginateInput,
	ListPaginateInputPath,
	ListPaginateInputPrefix,
	ListPaginateOutput,
	ListPaginateOutputPath,
	ListPaginateOutputPrefix,
} from '../../types';
import { list as listInternal } from '../internal/list';

interface ListApi {
	/**
	 * List files in pages with the given `path`.
	 * `pageSize` is defaulted to 1000. Additionally, the result will include a `nextToken` if there are more items to retrieve.
	 * @param input - The `ListPaginateInputPath` object.
	 * @param contextSpec - The context spec used to get the Amplify server context.
	 * @returns A list of objects with path and metadata
	 * @throws service: `S3Exception` - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: `StorageValidationErrorCode` - thrown when there are issues with credentials
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: ListPaginateInputPath,
	): Promise<ListPaginateOutputPath>;
	/**
	 * List all files from S3 for a given `path`. You can set `listAll` to true in `options` to get all the files from S3.
	 * @param input - The `ListAllInputPath` object.
	 * @param contextSpec - The context spec used to get the Amplify server context.
	 * @returns A list of all objects with path and metadata
	 * @throws service: `S3Exception` - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: `StorageValidationErrorCode`  - thrown when there are issues with credentials
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input: ListAllInputPath,
	): Promise<ListAllOutputPath>;
	/**
	 * @deprecated The `prefix` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/list | path} instead.
	 * List files in pages with the given `prefix`.
	 * `pageSize` is defaulted to 1000. Additionally, the result will include a `nextToken` if there are more items to retrieve.
	 * @param input - The `ListPaginateInputPrefix` object.
	 * @returns A list of objects with key and metadata
	 * @throws service: `S3Exception` - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: `StorageValidationErrorCode` - thrown when there are issues with credentials
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input?: ListPaginateInputPrefix,
	): Promise<ListPaginateOutputPrefix>;
	/**
	 * @deprecated The `prefix` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 * Please use {@link https://docs.amplify.aws/react/build-a-backend/storage/list | path} instead.
	 * List all files from S3 for a given `prefix`. You can set `listAll` to true in `options` to get all the files from S3.
	 * @param input - The `ListAllInputPrefix` object.
	 * @returns A list of all objects with key and metadata
	 * @throws service: `S3Exception` - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: `StorageValidationErrorCode`  - thrown when there are issues with credentials
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input?: ListAllInputPrefix,
	): Promise<ListAllOutputPrefix>;
}

export const list: ListApi = <
	Output extends ListAllOutput | ListPaginateOutput,
>(
	contextSpec: AmplifyServer.ContextSpec,
	input?: ListAllInput | ListPaginateInput,
): Promise<Output> => {
	return listInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input ?? {},
	) as Promise<Output>;
};

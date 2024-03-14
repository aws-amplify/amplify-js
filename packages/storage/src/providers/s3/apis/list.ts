// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Amplify } from '@aws-amplify/core';

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
	S3Exception,
} from '../types';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

import { list as listInternal } from './internal/list';

interface ListApi {
	/**
	 * List files with given prefix or path in pages
	 * pageSize defaulted to 1000. Additionally, the result will include a nextToken if there are more items to retrieve.
	 * @param input - The ListPaginateInput object.
	 * @returns A list of keys or paths and metadata for all objects in path
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(input?: ListPaginateInputPath): Promise<ListPaginateOutputPath>;
	/**
	 * List all files from S3. You can set `listAll` to true in `options` to get all the files from S3.
	 * @param input - The ListAllInput object.
	 * @returns A list of keys or paths and metadata for all objects in path
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(input?: ListAllInputPath): Promise<ListAllOutputPath>;
	/**
	 * @deprecated The `prefix` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 *
	 * List files with given prefix or path in pages
	 * pageSize defaulted to 1000. Additionally, the result will include a nextToken if there are more items to retrieve.
	 * @param input - The ListPaginateInput object.
	 * @returns A list of keys or paths and metadata for all objects in path
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(input?: ListPaginateInputPrefix): Promise<ListPaginateOutputPrefix>;
	/**
	 * @deprecated The `prefix` and `accessLevel` parameters are deprecated and may be removed in the next major version.
	 *
	 * List all files from S3. You can set `listAll` to true in `options` to get all the files from S3.
	 * @param input - The ListAllInput object.
	 * @returns A list of keys or paths and metadata for all objects in path
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(input?: ListAllInputPrefix): Promise<ListAllOutputPrefix>;
}

export const list: ListApi = (
	input?: ListAllInput | ListPaginateInput,
): Promise<ListAllOutput | ListPaginateOutput> => {
	return listInternal(Amplify, input ?? {});
};

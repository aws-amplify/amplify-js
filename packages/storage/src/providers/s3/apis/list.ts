// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	ListAllOptionsPath,
	ListAllOptionsPrefix,
	ListInput,
	ListOutput,
	ListPaginateOptionsPath,
	ListPaginateOptionsPrefix,
	S3Exception,
} from '../types';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { StorageListInputPath, StorageListInputPrefix } from '../../../types';

import { list as listInternal } from './internal/list';

interface ListApi {
	/**
	 * List single or all files in pages with given `path`.
	 * To list all the pages, you can set `listAll` to true in `options` to get all the files from S3.
	 * For pagination, pageSize defaults to 1000. Additionally, the result will include a nextToken if there are more items to retrieve.
	 * @param input - The ListPaginateInput object.
	 * @returns when listAll is true, A list of keys and metadata for all objects in path
	 * @returns when listAll is false, A list of keys and metadata with nextToken
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(
		input?: StorageListInputPath<ListAllOptionsPath | ListPaginateOptionsPath>,
	): Promise<ListOutput>;
	/**
	 * List single or all files in pages with given `prefix`
	 * To list all the pages, you can set `listAll` to true in `options` to get all the files from S3.
	 * For pagination, pageSize defaults to 1000. Additionally, the result will include a nextToken if there are more items to retrieve.
	 * @param input - The ListPaginateInput object.
	 * @returns when listAll is true, A list of keys and metadata for all objects in path
	 * @returns when listAll is false, A list of keys and metadata with nextToken
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(
		input?: StorageListInputPrefix<
			ListAllOptionsPrefix | ListPaginateOptionsPrefix
		>,
	): Promise<ListOutput>;
}

export const list: ListApi = (input?: ListInput): Promise<ListOutput> => {
	return listInternal(Amplify, input ?? {});
};

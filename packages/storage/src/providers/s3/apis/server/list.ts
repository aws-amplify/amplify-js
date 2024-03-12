// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	ListAllOptionsPath,
	ListAllOptionsPrefix,
	ListAllOutput,
	ListInput,
	ListPaginateOptionsPath,
	ListPaginateOptionsPrefix,
	ListPaginateOutput,
	S3Exception,
} from '../../types';
import { list as listInternal } from '../internal/list';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';
import {
	StorageListInputPath,
	StorageListInputPrefix,
} from '../../../../types';

interface ListApi {
	/**
	 * List single or all files in pages with given `path`.
	 * To list all the pages, you can set `listAll` to true in `options` to get all the files from S3.
	 * For pagination, pageSize defaults to 1000. Additionally, the result will include a nextToken if there are more items to retrieve.
	 * @param input - The StorageListInputPath object.
	 * @returns when listAll is true, A list of keys and metadata for all objects in path
	 * @returns when listAll is false, A list of keys and metadata with nextToken
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input?: StorageListInputPath<ListAllOptionsPath | ListPaginateOptionsPath>,
	): Promise<ListPaginateOutput>;
	/**
	 * List single or all files in pages with given `prefix`
	 * To list all the pages, you can set `listAll` to true in `options` to get all the files from S3.
	 * For pagination, pageSize defaults to 1000. Additionally, the result will include a nextToken if there are more items to retrieve.
	 * @param input - The StorageListInputPrefix object.
	 * @returns when listAll is true, A list of keys and metadata for all objects in path
	 * @returns when listAll is false, A list of keys and metadata with nextToken
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input?: StorageListInputPrefix<
			ListAllOptionsPrefix | ListPaginateOptionsPrefix
		>,
	): Promise<ListAllOutput>;
}

export const list: ListApi = (
	contextSpec: AmplifyServer.ContextSpec,
	input?: ListInput,
): Promise<ListAllOutput | ListPaginateOutput> => {
	return listInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input ?? {},
	);
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import {
	ListAllInput,
	ListAllOutput,
	ListPaginateInput,
	ListPaginateOutput,
	S3Exception,
} from '../../types';
import { list as listInternal } from '../internal/list';
import { StorageValidationErrorCode } from '../../../../errors/types/validation';

interface ListApi {
	/**
	 * Lists bucket objects with pagination.
	 * @param {ListPaginateInput} input The input object
	 * @return {Promise<ListPaginateOutput>} - Promise resolves to list of keys and metadata with
	 * pageSize defaulting to 1000. Additionally the result will include a nextToken if there are more items to retrieve
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input?: ListPaginateInput,
	): Promise<ListPaginateOutput>;
	/**
	 * Lists all bucket objects.
	 * @param {ListAllInput} input The input object
	 * @return {Promise<ListAllOutput>} - Promise resolves to list of keys and metadata for all objects in path
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		input?: ListAllInput,
	): Promise<ListAllOutput>;
}

export const list: ListApi = (
	contextSpec: AmplifyServer.ContextSpec,
	input?: ListAllInput | ListPaginateInput,
): Promise<ListAllOutput | ListPaginateOutput> => {
	return listInternal(
		getAmplifyServerContext(contextSpec).amplify,
		input ?? {},
	);
};

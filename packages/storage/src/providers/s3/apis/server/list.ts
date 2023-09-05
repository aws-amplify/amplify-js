// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	AmplifyServer,
	getAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';
import { ListRequest } from '../../../../types';
import {
	S3ListAllOptions,
	S3ListPaginateOptions,
	S3ListAllResult,
	S3ListPaginateResult,
} from '../../types';
import { list as listInternal } from '../internal/list';

type S3ListApi = {
	/**
	 * Lists bucket objects with pagination.
	 * @param {ListRequest<S3ListPaginateOptions>} listRequest - The request object
	 * @return {Promise<S3ListPaginateResult>} - Promise resolves to list of keys and metadata with
	 * pageSize defaulting to 1000. Additionally the result will include a nextToken if there are more items to retrieve
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		listRequest?: ListRequest<S3ListPaginateOptions>
	): Promise<S3ListPaginateResult>;
	/**
	 * Lists all bucket objects.
	 * @param {ListRequest<S3ListAllOptions>} listRequest - The request object
	 * @return {Promise<S3ListAllResult>} - Promise resolves to list of keys and metadata for all objects in path
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(
		contextSpec: AmplifyServer.ContextSpec,
		listRequest?: ListRequest<S3ListAllOptions>
	): Promise<S3ListAllResult>;
};

export const list: S3ListApi = (
	contextSpec: AmplifyServer.ContextSpec,
	listRequest?:
		| ListRequest<S3ListAllOptions>
		| ListRequest<S3ListPaginateOptions>
) => {
	return listInternal(
		getAmplifyServerContext(contextSpec).amplify,
		listRequest ?? {}
	);
};

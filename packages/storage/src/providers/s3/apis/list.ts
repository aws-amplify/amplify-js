// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import {
	StorageListAllOptions,
	StorageListPaginateOptions,
	StorageListRequest,
} from '../../..';
import { S3ListAllResult, S3ListPaginateResult } from '../types';
import { list as listInternal } from './internal/list';

type S3ListApi = {
	/**
	 * Lists all bucket objects.
	 * @param {StorageListRequest<StorageListAllOptions>} req - The request object
	 * @return {Promise<S3ListAllResult>} - Promise resolves to list of keys and metadata for all objects in path
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(req?: StorageListRequest<StorageListAllOptions>): Promise<S3ListAllResult>;
	/**
	 * Lists bucket objects with pagination.
	 * @param {StorageListRequest<StorageListPaginateOptions>} req - The request object
	 * @return {Promise<S3ListPaginateResult>} - Promise resolves to list of keys and metadata with
	 * pageSize defaulting to 1000. Additionally the result will include a nextToken if there are more items to retrieve
	 * @throws service: {@link S3Exception} - S3 service errors thrown when checking for existence of bucket
	 * @throws validation: {@link StorageValidationErrorCode } - thrown when there are issues with credentials
	 */
	(
		req?: StorageListRequest<StorageListPaginateOptions>
	): Promise<S3ListPaginateResult>;
};

export const list: S3ListApi = (
	req
): Promise<S3ListAllResult | S3ListPaginateResult> => {
	return listInternal(AmplifyV6, req ?? {});
};

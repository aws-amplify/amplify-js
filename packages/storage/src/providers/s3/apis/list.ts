// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { ListObjectsV2Input, listObjectsV2 } from '../../../AwsClients/S3';
import {
	StorageListRequest,
	StorageListAllOptions,
	StorageListPaginateOptions,
} from '../../../types';
import {
	S3ListOutputItem,
	StorageException,
	S3ListAllResult,
	S3ListPaginateResult,
} from '../types';
import {
	resolveStorageConfig,
	getKeyWithPrefix,
	resolveCredentials,
} from '../utils';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

const MAX_PAGE_SIZE = 1000;

type S3ListApi = {
	/**
	 * List all bucket objects
	 * @param {StorageListRequest<StorageListAllOptions>} req - The request object
	 * @return {Promise<S3ListAllResult>} - Promise resolves to list of keys and metadata for all objects in path
	 * @throws service: {@link StorageException} - S3 service errors thrown while getting properties
	 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
	 */
	(req: StorageListRequest<StorageListAllOptions>): Promise<S3ListAllResult>;
	/**
	 * List bucket objects with pagination
	 * @param {StorageListRequest<StorageListPaginateOptions>} req - The request object
	 * @return {Promise<S3ListPaginateResult>} - Promise resolves to list of keys and metadata for all objects in path
	 * additionally the result will include a nextToken if there are more items to retrieve
	 * @throws service: {@link StorageException} - S3 service errors thrown while getting properties
	 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
	 */
	(
		req: StorageListRequest<StorageListPaginateOptions>
	): Promise<S3ListPaginateResult>;
};

// TODO(ashwinkumar6) add unit test for list API
export const list: S3ListApi = async (
	req:
		| StorageListRequest<StorageListAllOptions>
		| StorageListRequest<StorageListPaginateOptions>
): Promise<S3ListAllResult | S3ListPaginateResult> => {
	const { identityId, credentials } = await resolveCredentials();
	const { defaultAccessLevel, bucket, region } = resolveStorageConfig();
	const {
		path,
		options: { accessLevel = defaultAccessLevel, listAll },
	} = req;

	const targetIdentityId =
		req?.options?.accessLevel === 'protected'
			? req.options?.targetIdentityId ?? identityId
			: undefined;

	const pageSize =
		req?.options?.listAll === true ? undefined : req.options?.pageSize;

	const nextToken =
		req?.options?.listAll === true ? undefined : req.options?.nextToken;

	const finalPath = getKeyWithPrefix(accessLevel, targetIdentityId, path);
	const listOptions = {
		region,
		credentials,
	};
	const listParams: ListObjectsV2Input = {
		Bucket: bucket,
		Prefix: finalPath,
		MaxKeys: pageSize,
		ContinuationToken: nextToken,
	};
	const listResult = listAll
		? await _listAll(listOptions, listParams)
		: await _list(listOptions, listParams);
	return listResult;
};

const _listAll = async (
	listOptions,
	listParams: ListObjectsV2Input
): Promise<S3ListAllResult> => {
	// TODO(ashwinkumar6) V6-logger: pageSize and nextToken aren't required when listing all items
	const listResult: S3ListOutputItem[] = [];
	let continuationToken = listParams.ContinuationToken;
	do {
		const { items: pageResults, nextToken: pageNextToken } = await _list(
			listOptions,
			{
				...listParams,
				ContinuationToken: continuationToken,
				MaxKeys: MAX_PAGE_SIZE,
			}
		);
		listResult.push(...pageResults);
		continuationToken = pageNextToken;
	} while (continuationToken);

	return {
		items: listResult,
	};
};

const _list = async (
	listOptions,
	listParams: ListObjectsV2Input
): Promise<S3ListPaginateResult> => {
	const listParamsClone = { ...listParams };
	if (!listParamsClone.MaxKeys || listParamsClone.MaxKeys > MAX_PAGE_SIZE) {
		listParamsClone.MaxKeys = MAX_PAGE_SIZE;
		// TODO(ashwinkumar6) V6-logger: defaulting pageSize to ${MAX_PAGE_SIZE}.
	}

	const response = await listObjectsV2(listOptions, listParamsClone);
	const listResult = response.Contents.map(item => ({
		key: item.Key.substring(listParamsClone.Prefix.length),
		eTag: item.ETag,
		lastModified: item.LastModified,
		size: item.Size,
	}));
	return {
		items: listResult,
		nextToken: response.NextContinuationToken,
	};
};

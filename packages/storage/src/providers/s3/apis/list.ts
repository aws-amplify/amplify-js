// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ListObjectsV2Input,
	ListObjectsV2Output,
	listObjectsV2,
} from '../../../AwsClients/S3';
import {
	StorageListRequest,
	StorageListAllOptions,
	StorageListPaginateOptions,
} from '../../../types';
import {
	S3ListOutputItem,
	S3Exception,
	S3ListAllResult,
	S3ListPaginateResult,
} from '../types';
import {
	resolveStorageConfig,
	getKeyWithPrefix,
	resolveCredentials,
} from '../utils';
import { ResolvedS3Config } from '../types/options';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

const MAX_PAGE_SIZE = 1000;

type S3ListApi = {
	/**
	 * Lists all bucket objects.
	 * @param {StorageListRequest<StorageListAllOptions>} req - The request object
	 * @return {Promise<S3ListAllResult>} - Promise resolves to list of keys and metadata for all objects in path
	 * @throws service: {@link S3Exception} - S3 service errors thrown while getting properties
	 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
	 */
	(req: StorageListRequest<StorageListAllOptions>): Promise<S3ListAllResult>;
	/**
	 * List bucket objects with pagination
	 * @param {StorageListRequest<StorageListPaginateOptions>} req - The request object
	 * @return {Promise<S3ListPaginateResult>} - Promise resolves to list of keys and metadata for all objects in path
	 * additionally the result will include a nextToken if there are more items to retrieve
	 * @throws service: {@link S3Exception} - S3 service errors thrown while getting properties
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
	const { path = '', options = {} } = req;
	const { accessLevel = defaultAccessLevel, listAll } = options;

	// TODO(ashwinkumar6) V6-logger: check if this can be refactored
	const finalPath = getKeyWithPrefix({
		accessLevel,
		targetIdentityId:
			options.accessLevel === 'protected'
				? options.targetIdentityId
				: identityId,
		key: path,
	});

	const listConfig = {
		region,
		credentials,
	};
	const listParams = {
		Bucket: bucket,
		Prefix: finalPath,
		MaxKeys: options?.listAll ? undefined : options?.pageSize,
		ContinuationToken: options?.listAll ? undefined : options?.nextToken,
	};
	return listAll
		? await _listAll(listConfig, listParams)
		: await _list(listConfig, listParams);
};

const _listAll = async (
	listConfig: ResolvedS3Config,
	listParams: ListObjectsV2Input
): Promise<S3ListAllResult> => {
	// TODO(ashwinkumar6) V6-logger: pageSize and nextToken aren't required when listing all items
	const listResult: S3ListOutputItem[] = [];
	let continuationToken = listParams.ContinuationToken;
	do {
		const { items: pageResults, nextToken: pageNextToken } = await _list(
			listConfig,
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
	listConfig: ResolvedS3Config,
	listParams: ListObjectsV2Input
): Promise<S3ListPaginateResult> => {
	const listParamsClone = { ...listParams };
	if (!listParamsClone.MaxKeys || listParamsClone.MaxKeys > MAX_PAGE_SIZE) {
		listParamsClone.MaxKeys = MAX_PAGE_SIZE;
		// TODO(ashwinkumar6) V6-logger: defaulting pageSize to ${MAX_PAGE_SIZE}.
	}

	const response: ListObjectsV2Output = await listObjectsV2(
		listConfig,
		listParamsClone
	);
	const listResult = response!.Contents!.map(item => ({
		key: item.Key!.substring(listParamsClone.Prefix!.length),
		eTag: item.ETag,
		lastModified: item.LastModified,
		size: item.Size,
	}));
	return {
		items: listResult,
		nextToken: response.NextContinuationToken,
	};
};

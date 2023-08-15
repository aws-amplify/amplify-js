// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6, ConsoleLogger as Logger } from '@aws-amplify/core';
import { ListObjectsV2Input, listObjectsV2 } from '../../../AwsClients/S3';
import { StorageListRequest, StorageListOptions } from '../../../types';
import { S3ListOutputItem, S3ListResult, StorageException } from '../types';
import { StorageValidationErrorCode } from '../../../errors/types/validation';

const MAX_PAGE_SIZE = 1000;

/**
 * List bucket objects
 * @param {StorageListRequest<StorageListOptions>} req - The request object
 * @return {Promise<StorageListResult>} - Promise resolves to list of keys and metadata for all objects in path
 * additionally the result will include a nextToken if there are more items to retrieve
 * @throws service: {@link StorageException} - S3 service errors thrown while getting properties
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
 */
export const list = async (
	req: StorageListRequest<StorageListOptions>
): Promise<S3ListResult> => {
	const { identityId, credentials } = await resolveCredentials();
	const { defaultAccessLevel, bucket, region } = resolveStorageConfig();
	const {
		path,
		options: { accessLevel = defaultAccessLevel, pageSize, nextToken, listAll },
	} = req;

	let targetIdentityId;
	if (req?.options?.accessLevel === 'protected') {
		targetIdentityId = req.options?.targetIdentityId ?? identityId;
	}

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
): Promise<S3ListResult> => {
	// TODO(ashwinkumar6) replace with V6 logger
	// if (listParams.MaxKeys || listParams.ContinuationToken) {
	// 	logger.warn(`pageSize should be from 0 - ${MAX_PAGE_SIZE}.`);
	// }

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
		nextToken: null,
	};
};

const _list = async (
	listOptions,
	listParams: ListObjectsV2Input
): Promise<S3ListResult> => {
	const listParamsClone = { ...listParams };
	if (!listParamsClone.MaxKeys || listParamsClone.MaxKeys > MAX_PAGE_SIZE) {
		listParamsClone.MaxKeys = MAX_PAGE_SIZE;
		// TODO(ashwinkumar6) replace with V6 logger
		// logger.warn(`defaulting pageSize to ${MAX_PAGE_SIZE}.`);
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

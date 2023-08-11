// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6 } from '@aws-amplify/core';
import { prefixResolver as defaultPrefixResolver } from '../../../utils/prefixResolver';
import { StorageListRequest, StorageListOptions } from '../../../types';
import { S3ListOutputItem } from '../types';
import { ListObjectsV2Input, listObjectsV2 } from '../../../AwsClients/S3';
import { assertValidationError } from '../../../errors/assertValidationErrors';
import { StorageValidationErrorCode } from '../../../errors/types/validation';
import { ConsoleLogger as Logger } from '@aws-amplify/core';

// TODO are we using Logger in V6
const logger = new Logger('AWSS3Provider');
const MAX_PAGE_SIZE = 1000;

/**
 * List bucket objects
 * @param {StorageListRequest<StorageListOptions>} req - The request object
 * @return {Promise<StorageListResult>} - Promise resolves to list of keys and metadata for all objects in path
 * additionally the result will include a nextToken if there are more items to retrieve
 * @throws service: {@link ListException} - S3 service errors thrown while getting properties
 * @throws validation: {@link StorageValidationErrorCode } - Validation errors thrown
 */
export const list = async (
	req: StorageListRequest<StorageListOptions>
): Promise<S3ListOutputItem> => {
	const { awsCredsIdentityId, awsCreds, defaultAccessLevel, bucket, region } =
		await getStorageConfig();
	const {
		path,
		options: {
			accessLevel = defaultAccessLevel,
			targetIdentityId = awsCredsIdentityId,
			pageSize,
			nextToken,
			listAll,
		},
	} = req;
	const finalPath = getKeyWithPrefix(accessLevel, awsCredsIdentityId, path);
	const listOptions = {
		accessLevel,
		targetIdentityId: awsCredsIdentityId,
		region,
		credentials: awsCreds,
	};
	const listParams: ListObjectsV2Input = {
		Bucket: bucket,
		Prefix: finalPath,
		MaxKeys: pageSize ?? MAX_PAGE_SIZE,
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
): Promise<S3ListOutputItem> => {
	let listResult: StorageListOutputItem[];
	do {
		const { items: pageResults, nextToken: pageNextToken } = await _list(
			listOptions,
			listParams
		);
		listResult.push(...pageResults);
		listParams.ContinuationToken = pageNextToken;
	} while (listParams.ContinuationToken);

	return {
		items: listResult,
		nextToken: null,
	};
};

const _list = async (
	listOptions,
	listParams: ListObjectsV2Input
): Promise<S3ListOutputItem> => {
	if (listParams.MaxKeys > MAX_PAGE_SIZE) {
		listParams.MaxKeys = MAX_PAGE_SIZE;
		logger.warn(`pageSize should be from 0 - ${MAX_PAGE_SIZE}.`);
	}

	const response = await listObjectsV2(listOptions, listParams);
	const listResult = response.Contents.map(item => ({
		key: item.Key.substring(listParams.Prefix.length),
		eTag: item.ETag,
		lastModified: item.LastModified,
		size: item.Size,
	}));
	return {
		items: listResult,
		nextToken: response.NextContinuationToken,
	};
};

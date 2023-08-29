// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ListObjectsV2Input,
	ListObjectsV2Output,
	listObjectsV2,
} from '../../../../AwsClients/S3';
import {
	StorageListRequest,
	StorageListAllOptions,
	StorageListPaginateOptions,
} from '../../../../types';
import {
	S3ListOutputItem,
	S3ListAllResult,
	S3ListPaginateResult,
} from '../../types';
import { resolveS3ConfigAndInput } from '../../utils';
import { ResolvedS3Config } from '../../types/options';
import { AmplifyClassV6 } from '@aws-amplify/core';

const MAX_PAGE_SIZE = 1000;

type ListRequestArgs = {
	s3Config: ResolvedS3Config;
	listParams: ListObjectsV2Input;
	prefix: string;
};

export const list = async (
	amplify: AmplifyClassV6,
	listRequest?:
		| StorageListRequest<StorageListAllOptions>
		| StorageListRequest<StorageListPaginateOptions>
): Promise<S3ListAllResult | S3ListPaginateResult> => {
	const { options = {}, path = '' } = listRequest ?? {};
	const {
		s3Config,
		bucket,
		keyPrefix: prefix,
	} = await resolveS3ConfigAndInput(amplify, options);
	const listParams = {
		Bucket: bucket,
		Prefix: `${prefix}${path}`,
		MaxKeys: options?.listAll ? undefined : options?.pageSize,
		ContinuationToken: options?.listAll ? undefined : options?.nextToken,
	};
	return options.listAll
		? await _listAll({ s3Config, listParams, prefix })
		: await _list({ s3Config, listParams, prefix });
};

const _listAll = async ({
	s3Config,
	listParams,
	prefix,
}: ListRequestArgs): Promise<S3ListAllResult> => {
	// TODO(ashwinkumar6) V6-logger: pageSize and nextToken aren't required when listing all items
	const listResult: S3ListOutputItem[] = [];
	let continuationToken = listParams.ContinuationToken;
	do {
		const { items: pageResults, nextToken: pageNextToken } = await _list({
			prefix,
			s3Config,
			listParams: {
				...listParams,
				ContinuationToken: continuationToken,
				MaxKeys: MAX_PAGE_SIZE,
			},
		});
		listResult.push(...pageResults);
		continuationToken = pageNextToken;
	} while (continuationToken);

	return {
		items: listResult,
	};
};

const _list = async ({
	s3Config,
	listParams,
	prefix,
}: ListRequestArgs): Promise<S3ListPaginateResult> => {
	const listParamsClone = { ...listParams };
	if (!listParamsClone.MaxKeys || listParamsClone.MaxKeys > MAX_PAGE_SIZE) {
		listParamsClone.MaxKeys = MAX_PAGE_SIZE;
		// TODO(ashwinkumar6) V6-logger: defaulting pageSize to ${MAX_PAGE_SIZE}.
	}

	const response: ListObjectsV2Output = await listObjectsV2(
		s3Config,
		listParamsClone
	);

	if (!response?.Contents) {
		return {
			items: [],
		};
	}

	const listResult = response.Contents.map(item => ({
		key: item.Key!.substring(prefix.length),
		eTag: item.ETag,
		lastModified: item.LastModified,
		size: item.Size,
	}));
	return {
		items: listResult,
		nextToken: response.NextContinuationToken,
	};
};

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import {
	ListAllInput,
	ListPaginateInput,
	ListAllOutput,
	ListPaginateOutput,
	ListOutputItem,
} from '../../types';
import { resolveS3ConfigAndInput } from '../../utils';
import { ResolvedS3Config } from '../../types/options';
import {
	listObjectsV2,
	ListObjectsV2Input,
	ListObjectsV2Output,
} from '../../utils/client';

const MAX_PAGE_SIZE = 1000;

type ListInputArgs = {
	s3Config: ResolvedS3Config;
	listParams: ListObjectsV2Input;
	prefix: string;
};

export const list = async (
	amplify: AmplifyClassV6,
	input?: ListAllInput | ListPaginateInput
): Promise<ListAllOutput | ListPaginateOutput> => {
	const { options = {}, prefix: path = '' } = input ?? {};
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
}: ListInputArgs): Promise<ListAllOutput> => {
	// TODO(ashwinkumar6) V6-logger: pageSize and nextToken aren't required when listing all items
	const listResult: ListOutputItem[] = [];
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
}: ListInputArgs): Promise<ListPaginateOutput> => {
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

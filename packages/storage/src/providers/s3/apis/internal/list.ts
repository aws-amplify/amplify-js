// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';
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
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';

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
	// @ts-expect-error pageSize and nextToken should not coexist with listAll
	if (options?.listAll && (options?.pageSize || options?.nextToken)) {
		const anyOptions = options as any;
		logger.debug(
			`listAll is set to true, ignoring ${
				anyOptions?.pageSize ? `pageSize: ${anyOptions?.pageSize}` : ''
			} ${anyOptions?.nextToken ? `nextToken: ${anyOptions?.nextToken}` : ''}.`
		);
	}
	const listParams = {
		Bucket: bucket,
		Prefix: `${prefix}${path}`,
		MaxKeys: options?.listAll ? undefined : options?.pageSize,
		ContinuationToken: options?.listAll ? undefined : options?.nextToken,
	};
	logger.debug(`listing items from "${listParams.Prefix}"`);
	return options.listAll
		? await _listAll({ s3Config, listParams, prefix })
		: await _list({ s3Config, listParams, prefix });
};

const _listAll = async ({
	s3Config,
	listParams,
	prefix,
}: ListInputArgs): Promise<ListAllOutput> => {
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
		logger.debug(`defaulting pageSize to ${MAX_PAGE_SIZE}.`);
		listParamsClone.MaxKeys = MAX_PAGE_SIZE;
	}

	const response: ListObjectsV2Output = await listObjectsV2(
		{
			...s3Config,
			userAgentValue: getStorageUserAgentValue(StorageAction.List),
		},
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

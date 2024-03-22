// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	ListAllInput,
	ListAllOutput,
	ListAllOutputPath,
	ListAllOutputPrefix,
	ListOutputItemKey,
	ListOutputItemPath,
	ListPaginateInput,
	ListPaginateOutput,
	ListPaginateOutputPath,
	ListPaginateOutputPrefix,
} from '../../types';
import {
	resolveS3ConfigAndInput,
	validateStorageOperationInputWithPrefix,
} from '../../utils';
import { ResolvedS3Config } from '../../types/options';
import {
	ListObjectsV2Input,
	ListObjectsV2Output,
	listObjectsV2,
} from '../../utils/client';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';
import { STORAGE_INPUT_PREFIX } from '../../utils/constants';

const MAX_PAGE_SIZE = 1000;

interface ListInputArgs {
	s3Config: ResolvedS3Config;
	listParams: ListObjectsV2Input;
	generatedPrefix: string;
}

export const list = async (
	amplify: AmplifyClassV6,
	input: ListAllInput | ListPaginateInput,
): Promise<ListAllOutput | ListPaginateOutput> => {
	const { options = {} } = input;
	const {
		s3Config,
		bucket,
		keyPrefix: generatedPrefix,
		identityId,
	} = await resolveS3ConfigAndInput(amplify, options);

	const { inputType, objectKey } = validateStorageOperationInputWithPrefix(
		input,
		identityId,
	);
	const path =
		inputType === STORAGE_INPUT_PREFIX
			? `${generatedPrefix}${objectKey}`
			: objectKey;

	// @ts-expect-error pageSize and nextToken should not coexist with listAll
	if (options?.listAll && (options?.pageSize || options?.nextToken)) {
		const anyOptions = options as any;
		logger.debug(
			`listAll is set to true, ignoring ${
				anyOptions?.pageSize ? `pageSize: ${anyOptions?.pageSize}` : ''
			} ${anyOptions?.nextToken ? `nextToken: ${anyOptions?.nextToken}` : ''}.`,
		);
	}
	const listParams = {
		Bucket: bucket,
		Prefix: path,
		MaxKeys: options?.listAll ? undefined : options?.pageSize,
		ContinuationToken: options?.listAll ? undefined : options?.nextToken,
	};
	logger.debug(`listing items from "${listParams.Prefix}"`);

	return options.listAll
		? inputType === STORAGE_INPUT_PREFIX
			? _listAllPrefix({
					s3Config,
					listParams,
					generatedPrefix,
				})
			: _listAllPath({
					s3Config,
					listParams,
					generatedPrefix,
				})
		: inputType === STORAGE_INPUT_PREFIX
			? _listPrefix({ s3Config, listParams, generatedPrefix })
			: _listPath({ s3Config, listParams, generatedPrefix });
};

const _listAllPrefix = async ({
	s3Config,
	listParams,
	generatedPrefix,
}: ListInputArgs): Promise<ListAllOutputPrefix> => {
	const listResult: ListOutputItemKey[] = [];
	let continuationToken = listParams.ContinuationToken;
	do {
		const { items: pageResults, nextToken: pageNextToken } = await _listPrefix({
			generatedPrefix,
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

const _listPrefix = async ({
	s3Config,
	listParams,
	generatedPrefix,
}: ListInputArgs): Promise<ListPaginateOutputPrefix> => {
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
		listParamsClone,
	);

	if (!response?.Contents) {
		return {
			items: [],
		};
	}

	return {
		items: response.Contents.map(item => ({
			key: item.Key!.substring(generatedPrefix.length),
			eTag: item.ETag,
			lastModified: item.LastModified,
			size: item.Size,
		})),
		nextToken: response.NextContinuationToken,
	};
};

const _listAllPath = async ({
	s3Config,
	listParams,
	generatedPrefix,
}: ListInputArgs): Promise<ListAllOutputPath> => {
	const listResult: ListOutputItemPath[] = [];
	let continuationToken = listParams.ContinuationToken;
	do {
		const { items: pageResults, nextToken: pageNextToken } = await _listPath({
			generatedPrefix,
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

const _listPath = async ({
	s3Config,
	listParams,
}: ListInputArgs): Promise<ListPaginateOutputPath> => {
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
		listParamsClone,
	);

	if (!response?.Contents) {
		return {
			items: [],
		};
	}

	return {
		items: response.Contents.map(item => ({
			path: item.Key!,
			eTag: item.ETag,
			lastModified: item.LastModified,
			size: item.Size,
		})),
		nextToken: response.NextContinuationToken,
	};
};

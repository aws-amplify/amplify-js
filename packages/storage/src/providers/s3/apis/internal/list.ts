// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	ListAllInput,
	ListAllOutput,
	ListOutputItemKey,
	ListOutputItemPath,
	ListPaginateInput,
	ListPaginateOutput,
} from '../../types';
import {
	resolveS3ConfigAndInput,
	validateStorageOperationInput,
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
	storageInputType: string;
}

export const list = async (
	amplify: AmplifyClassV6,
	input?: ListAllInput | ListPaginateInput,
): Promise<ListAllOutput | ListPaginateOutput> => {
	const { options = {} } = input ?? {};
	let path = '';
	let storageInputType;
	const {
		s3Config,
		bucket,
		keyPrefix: generatedPrefix,
		identityId,
	} = await resolveS3ConfigAndInput(amplify, options);

	// Handle cases when input is undefined or empty
	if (!input || Object.keys(input).length === 0) {
		path = `${generatedPrefix}`;
		storageInputType = STORAGE_INPUT_PREFIX;
	} else {
		// Handle cases when input has a path or prefix
		const { inputType, objectKey } = validateStorageOperationInput(
			input,
			identityId,
		);
		path =
			inputType === STORAGE_INPUT_PREFIX
				? `${generatedPrefix}${objectKey}`
				: objectKey;
		storageInputType = inputType;
	}

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
		? _listAll({ s3Config, listParams, storageInputType, generatedPrefix })
		: _list({ s3Config, listParams, storageInputType, generatedPrefix });
};

const _listAll = async ({
	s3Config,
	listParams,
	storageInputType,
	generatedPrefix,
}: ListInputArgs): Promise<ListAllOutput> => {
	const listResult: (ListOutputItemKey | ListOutputItemPath)[] = [];
	let continuationToken = listParams.ContinuationToken;
	do {
		const { items: pageResults, nextToken: pageNextToken } = await _list({
			generatedPrefix,
			s3Config,
			storageInputType,
			listParams: {
				...listParams,
				ContinuationToken: continuationToken,
				MaxKeys: MAX_PAGE_SIZE,
			},
		});
		listResult.push(...pageResults);
		continuationToken = pageNextToken;
	} while (continuationToken);

	if (storageInputType === STORAGE_INPUT_PREFIX) {
		return {
			items: listResult as ListOutputItemKey[],
		};
	} else {
		return {
			items: listResult as ListOutputItemPath[],
		};
	}
};

const _list = async ({
	s3Config,
	listParams,
	storageInputType,
	generatedPrefix,
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
		listParamsClone,
	);

	if (!response?.Contents) {
		return {
			items: [],
		};
	}

	if (storageInputType === STORAGE_INPUT_PREFIX) {
		return {
			items: response.Contents.map(item => ({
				key: item.Key!.substring(generatedPrefix.length),
				eTag: item.ETag,
				lastModified: item.LastModified,
				size: item.Size,
			})),
			nextToken: response.NextContinuationToken,
		};
	} else {
		return {
			items: response.Contents.map(item => ({
				path: item.Key!,
				eTag: item.ETag,
				lastModified: item.LastModified,
				size: item.Size,
			})),
			nextToken: response.NextContinuationToken,
		};
	}
};

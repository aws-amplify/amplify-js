// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyClassV6 } from '@aws-amplify/core';
import { StorageAction } from '@aws-amplify/core/internals/utils';

import {
	ListAllOutput,
	ListAllWithPathOutput,
	ListOutputItem,
	ListOutputItemWithPath,
	ListPaginateOutput,
	ListPaginateWithPathOutput,
} from '../../types';
import {
	resolveS3ConfigAndInput,
	urlDecode,
	validateBucketOwnerID,
	validateStorageOperationInputWithPrefix,
} from '../../utils';
import {
	ListAllWithPathOptions,
	ListPaginateWithPathOptions,
	ResolvedS3Config,
} from '../../types/options';
import {
	ListObjectsV2Input,
	ListObjectsV2Output,
	listObjectsV2,
} from '../../utils/client/s3data';
import { getStorageUserAgentValue } from '../../utils/userAgent';
import { logger } from '../../../../utils';
import { DEFAULT_DELIMITER, STORAGE_INPUT_PREFIX } from '../../utils/constants';
import { CommonPrefix } from '../../utils/client/s3data/types';
import { IntegrityError } from '../../../../errors/IntegrityError';
import { ListAllInput, ListPaginateInput } from '../../types/inputs';
// TODO: Remove this interface when we move to public advanced APIs.
import { ListInput as ListWithPathInputAndAdvancedOptions } from '../../../../internals/types/inputs';

const MAX_PAGE_SIZE = 1000;

interface ListInputArgs {
	s3Config: ResolvedS3Config;
	listParams: ListObjectsV2Input;
	generatedPrefix?: string;
}

export const list = async (
	amplify: AmplifyClassV6,
	input: ListAllInput | ListPaginateInput | ListWithPathInputAndAdvancedOptions,
): Promise<
	| ListAllOutput
	| ListPaginateOutput
	| ListAllWithPathOutput
	| ListPaginateWithPathOutput
> => {
	const { options = {} } = input;
	const {
		s3Config,
		bucket,
		keyPrefix: generatedPrefix,
		identityId,
	} = await resolveS3ConfigAndInput(amplify, input);

	const { inputType, objectKey } = validateStorageOperationInputWithPrefix(
		input,
		identityId,
	);
	validateBucketOwnerID(options.expectedBucketOwner);
	const isInputWithPrefix = inputType === STORAGE_INPUT_PREFIX;

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
		Prefix: isInputWithPrefix ? `${generatedPrefix}${objectKey}` : objectKey,
		MaxKeys: options?.listAll ? undefined : options?.pageSize,
		ContinuationToken: options?.listAll ? undefined : options?.nextToken,
		Delimiter: getDelimiter(options),
		ExpectedBucketOwner: options?.expectedBucketOwner,
		EncodingType: 'url',
	};
	logger.debug(`listing items from "${listParams.Prefix}"`);

	const listInputArgs: ListInputArgs = {
		s3Config,
		listParams,
	};

	if (options.listAll) {
		if (isInputWithPrefix) {
			return _listAllWithPrefix({
				...listInputArgs,
				generatedPrefix,
			});
		} else {
			return _listAllWithPath(listInputArgs);
		}
	} else {
		if (isInputWithPrefix) {
			return _listWithPrefix({ ...listInputArgs, generatedPrefix });
		} else {
			return _listWithPath(listInputArgs);
		}
	}
};

/** @deprecated Use {@link _listAllWithPath} instead. */
const _listAllWithPrefix = async ({
	s3Config,
	listParams,
	generatedPrefix,
}: ListInputArgs): Promise<ListAllOutput> => {
	const listResult: ListOutputItem[] = [];
	let continuationToken = listParams.ContinuationToken;
	do {
		const { items: pageResults, nextToken: pageNextToken } =
			await _listWithPrefix({
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

/** @deprecated Use {@link _listWithPath} instead. */
const _listWithPrefix = async ({
	s3Config,
	listParams,
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

	const listOutput = decodeEncodedElements(response);

	validateEchoedElements(listParamsClone, listOutput);

	if (!listOutput?.Contents) {
		return {
			items: [],
		};
	}

	return {
		items: listOutput.Contents.map(item => ({
			key: generatedPrefix
				? item.Key!.substring(generatedPrefix.length)
				: item.Key!,
			eTag: item.ETag,
			lastModified: item.LastModified,
			size: item.Size,
		})),
		nextToken: listOutput.NextContinuationToken,
	};
};

const _listAllWithPath = async ({
	s3Config,
	listParams,
}: ListInputArgs): Promise<ListAllWithPathOutput> => {
	const listResult: ListOutputItemWithPath[] = [];
	const excludedSubpaths: string[] = [];
	let continuationToken = listParams.ContinuationToken;
	do {
		const {
			items: pageResults,
			excludedSubpaths: pageExcludedSubpaths,
			nextToken: pageNextToken,
		} = await _listWithPath({
			s3Config,
			listParams: {
				...listParams,
				ContinuationToken: continuationToken,
				MaxKeys: MAX_PAGE_SIZE,
			},
		});
		listResult.push(...pageResults);
		excludedSubpaths.push(...(pageExcludedSubpaths ?? []));
		continuationToken = pageNextToken;
	} while (continuationToken);

	return {
		items: listResult,
		excludedSubpaths,
	};
};

const _listWithPath = async ({
	s3Config,
	listParams,
}: ListInputArgs): Promise<ListPaginateWithPathOutput> => {
	const listParamsClone = { ...listParams };
	if (!listParamsClone.MaxKeys || listParamsClone.MaxKeys > MAX_PAGE_SIZE) {
		logger.debug(`defaulting pageSize to ${MAX_PAGE_SIZE}.`);
		listParamsClone.MaxKeys = MAX_PAGE_SIZE;
	}

	const response = await listObjectsV2(
		{
			...s3Config,
			userAgentValue: getStorageUserAgentValue(StorageAction.List),
		},
		listParamsClone,
	);

	const listOutput = decodeEncodedElements(response);

	validateEchoedElements(listParamsClone, listOutput);

	const {
		Contents: contents,
		NextContinuationToken: nextContinuationToken,
		CommonPrefixes: commonPrefixes,
	}: ListObjectsV2Output = listOutput;

	const excludedSubpaths =
		commonPrefixes && mapCommonPrefixesToExcludedSubpaths(commonPrefixes);

	if (!contents) {
		return {
			items: [],
			nextToken: nextContinuationToken,
			excludedSubpaths,
		};
	}

	return {
		items: contents.map(item => ({
			path: item.Key!,
			eTag: item.ETag,
			lastModified: item.LastModified,
			size: item.Size,
		})),
		nextToken: nextContinuationToken,
		excludedSubpaths,
	};
};

const mapCommonPrefixesToExcludedSubpaths = (
	commonPrefixes: CommonPrefix[],
): string[] => {
	return commonPrefixes.reduce((mappedSubpaths, { Prefix }) => {
		if (Prefix) {
			mappedSubpaths.push(Prefix);
		}

		return mappedSubpaths;
	}, [] as string[]);
};

const getDelimiter = (
	options?: ListAllWithPathOptions | ListPaginateWithPathOptions,
): string | undefined => {
	if (options?.subpathStrategy?.strategy === 'exclude') {
		return options?.subpathStrategy?.delimiter ?? DEFAULT_DELIMITER;
	}
};

const validateEchoedElements = (
	listInput: ListObjectsV2Input,
	listOutput: ListObjectsV2Output,
) => {
	const validEchoedParameters =
		listInput.Bucket === listOutput.Name &&
		listInput.Delimiter === listOutput.Delimiter &&
		listInput.MaxKeys === listOutput.MaxKeys &&
		listInput.Prefix === listOutput.Prefix &&
		listInput.ContinuationToken === listOutput.ContinuationToken;

	if (!validEchoedParameters) {
		throw new IntegrityError({ metadata: listOutput.$metadata });
	}
};

/**
 * Decodes URL-encoded elements in the S3 `ListObjectsV2Output` response when `EncodingType` is `'url'`.
 * Applies to values for 'Delimiter', 'Prefix', 'StartAfter' and 'Key' in the response.
 */
const decodeEncodedElements = (
	listOutput: ListObjectsV2Output,
): ListObjectsV2Output => {
	if (listOutput.EncodingType !== 'url') {
		return listOutput;
	}

	const decodedListOutput = { ...listOutput };

	// Decode top-level properties
	(['Delimiter', 'Prefix', 'StartAfter'] as const).forEach(prop => {
		const value = listOutput[prop];
		if (typeof value === 'string') {
			decodedListOutput[prop] = urlDecode(value);
		}
	});

	// Decode 'Key' in each item of 'Contents', if it exists
	if (listOutput.Contents) {
		decodedListOutput.Contents = listOutput.Contents.map(content => ({
			...content,
			Key: content.Key ? urlDecode(content.Key) : content.Key,
		}));
	}

	// Decode 'Prefix' in each item of 'CommonPrefixes', if it exists
	if (listOutput.CommonPrefixes) {
		decodedListOutput.CommonPrefixes = listOutput.CommonPrefixes.map(
			content => ({
				...content,
				Prefix: content.Prefix ? urlDecode(content.Prefix) : content.Prefix,
			}),
		);
	}

	return decodedListOutput;
};

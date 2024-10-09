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

	validateEchoedElements(listParamsClone, response);

	if (!response?.Contents) {
		return {
			items: [],
		};
	}

	return {
		items: response.Contents.map(item => ({
			key: generatedPrefix
				? item.Key!.substring(generatedPrefix.length)
				: item.Key!,
			eTag: item.ETag,
			lastModified: item.LastModified,
			size: item.Size,
		})),
		nextToken: response.NextContinuationToken,
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

	const listOutput = await listObjectsV2(
		{
			...s3Config,
			userAgentValue: getStorageUserAgentValue(StorageAction.List),
		},
		listParamsClone,
	);

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
		throw new IntegrityError();
	}
};

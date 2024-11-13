// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';
import {
	AmplifyUrl,
	AmplifyUrlSearchParams,
} from '@aws-amplify/core/internals/utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import {
	assignStringVariables,
	buildStorageServiceError,
	deserializeBoolean,
	deserializeNumber,
	deserializeTimestamp,
	emptyArrayGuard,
	map,
	parseXmlBody,
	s3TransferHandler,
} from '../utils';
import { IntegrityError } from '../../../../../errors/IntegrityError';
import { urlDecode } from '../../urlDecoder';

import type {
	ListObjectsV2CommandInput,
	ListObjectsV2CommandOutput,
} from './types';
import { defaultConfig, parseXmlError } from './base';

export type ListObjectsV2Input = ListObjectsV2CommandInput;

export type ListObjectsV2Output = ListObjectsV2CommandOutput;

const listObjectsV2Serializer = (
	input: ListObjectsV2Input,
	endpoint: Endpoint,
): HttpRequest => {
	const headers = assignStringVariables({
		'x-amz-request-payer': input.RequestPayer,
		'x-amz-expected-bucket-owner': input.ExpectedBucketOwner,
	});
	const query = assignStringVariables({
		'list-type': '2',
		'continuation-token': input.ContinuationToken,
		delimiter: input.Delimiter,
		'encoding-type': input.EncodingType,
		'fetch-owner': input.FetchOwner,
		'max-keys': input.MaxKeys,
		prefix: input.Prefix,
		'start-after': input.StartAfter,
	});
	const url = new AmplifyUrl(endpoint.url.toString());
	url.search = new AmplifyUrlSearchParams(query).toString();

	return {
		method: 'GET',
		headers,
		url,
	};
};

const listObjectsV2Deserializer = async (
	response: HttpResponse,
): Promise<ListObjectsV2Output> => {
	if (response.statusCode >= 300) {
		// error is always set when statusCode >= 300
		const error = (await parseXmlError(response)) as Error;
		throw buildStorageServiceError(error, response.statusCode);
	} else {
		const parsed = await parseXmlBody(response);
		const contents = map(parsed, {
			CommonPrefixes: [
				'CommonPrefixes',
				value => emptyArrayGuard(value, deserializeCommonPrefixList),
			],
			Contents: [
				'Contents',
				value => emptyArrayGuard(value, deserializeObjectList),
			],
			ContinuationToken: 'ContinuationToken',
			Delimiter: 'Delimiter',
			EncodingType: 'EncodingType',
			IsTruncated: ['IsTruncated', deserializeBoolean],
			KeyCount: ['KeyCount', deserializeNumber],
			MaxKeys: ['MaxKeys', deserializeNumber],
			Name: 'Name',
			NextContinuationToken: 'NextContinuationToken',
			Prefix: 'Prefix',
			StartAfter: 'StartAfter',
		});

		const output = decodeEncodedElements({
			$metadata: parseMetadata(response),
			...contents,
		});

		validateCorroboratingElements(output);

		return output;
	}
};

const deserializeCommonPrefixList = (output: any[]) =>
	output.map(deserializeCommonPrefix);

const deserializeCommonPrefix = (output: any) =>
	map(output, {
		Prefix: 'Prefix',
	});

const deserializeObjectList = (output: any[]) => output.map(deserializeObject);

const deserializeObject = (output: any) =>
	map(output, {
		Key: 'Key',
		LastModified: ['LastModified', deserializeTimestamp],
		ETag: 'ETag',
		ChecksumAlgorithm: [
			'ChecksumAlgorithm',
			value => emptyArrayGuard(value, deserializeChecksumAlgorithmList),
		],
		Size: ['Size', deserializeNumber],
		StorageClass: 'StorageClass',
		Owner: ['Owner', deserializeOwner],
	});

const deserializeChecksumAlgorithmList = (output: any[]) =>
	output.map(entry => String(entry));

const deserializeOwner = (output: any) =>
	map(output, { DisplayName: 'DisplayName', ID: 'ID' });

const validateCorroboratingElements = (response: ListObjectsV2Output) => {
	const {
		IsTruncated,
		KeyCount,
		Contents = [],
		CommonPrefixes = [],
		NextContinuationToken,
	} = response;

	const validTruncation =
		(IsTruncated && !!NextContinuationToken) ||
		(!IsTruncated && !NextContinuationToken);

	const validNumberOfKeysReturned =
		KeyCount === Contents.length + CommonPrefixes.length;

	if (!validTruncation || !validNumberOfKeysReturned) {
		throw new IntegrityError();
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

export const listObjectsV2 = composeServiceApi(
	s3TransferHandler,
	listObjectsV2Serializer,
	listObjectsV2Deserializer,
	{ ...defaultConfig, responseType: 'text' },
);

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import type {
	ListObjectsV2CommandInput,
	ListObjectsV2CommandOutput,
} from './types';
import { defaultConfig } from './base';
import {
	assignStringVariables,
	deserializeBoolean,
	deserializeNumber,
	deserializeTimestamp,
	emptyArrayGuard,
	map,
	parseXmlBody,
	parseXmlError,
	s3TransferHandler,
	serializePathnameObjectKey,
} from './utils';

export type ListObjectsV2Input = ListObjectsV2CommandInput;

export type ListObjectsV2Output = ListObjectsV2CommandOutput;

const listObjectsV2Serializer = (
	input: ListObjectsV2Input,
	endpoint: Endpoint
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
	const url = new URL(endpoint.url.toString());
	url.search = new URLSearchParams(query).toString();
	return {
		method: 'GET',
		headers,
		url,
	};
};

const listObjectsV2Deserializer = async (
	response: HttpResponse
): Promise<ListObjectsV2Output> => {
	if (response.statusCode >= 300) {
		const error = await parseXmlError(response);
		throw error;
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
		return {
			$metadata: parseMetadata(response),
			...contents,
		};
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

export const listObjectsV2 = composeServiceApi(
	s3TransferHandler,
	listObjectsV2Serializer,
	listObjectsV2Deserializer,
	{ ...defaultConfig, responseType: 'text' }
);

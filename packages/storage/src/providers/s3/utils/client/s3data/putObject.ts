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
	map,
	s3TransferHandler,
	serializeObjectConfigsToHeaders,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from '../utils';
import { validateObjectUrl } from '../../validateObjectUrl';

import { defaultConfig, parseXmlError } from './base';
import type { PutObjectCommandInput, PutObjectCommandOutput } from './types';

export type PutObjectInput = Pick<
	PutObjectCommandInput,
	| 'Bucket'
	| 'Key'
	| 'Body'
	| 'ACL'
	| 'CacheControl'
	| 'ContentDisposition'
	| 'ContentEncoding'
	| 'ContentType'
	| 'ContentMD5'
	| 'Expires'
	| 'Metadata'
	| 'Tagging'
	| 'ChecksumCRC32'
	| 'ExpectedBucketOwner'
	| 'IfNoneMatch'
>;

export type PutObjectOutput = Pick<
	PutObjectCommandOutput,
	// PutObject output is not exposed in public API, but only logged in the debug mode
	// so we only expose $metadata, ETag and VersionId for debug purpose.
	'$metadata' | 'ETag' | 'VersionId'
>;

const putObjectSerializer = async (
	input: PutObjectInput,
	endpoint: Endpoint,
): Promise<HttpRequest> => {
	const headers = {
		...(await serializeObjectConfigsToHeaders({
			...input,
			ContentType: input.ContentType ?? 'application/octet-stream',
		})),
		...assignStringVariables({
			'content-md5': input.ContentMD5,
			'x-amz-checksum-crc32': input.ChecksumCRC32,
			'x-amz-expected-bucket-owner': input.ExpectedBucketOwner,
			'If-None-Match': input.IfNoneMatch,
		}),
	};
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);
	url.search = new AmplifyUrlSearchParams({
		'x-id': 'PutObject',
	}).toString();
	validateObjectUrl({
		bucketName: input.Bucket,
		key: input.Key,
		objectURL: url,
	});

	return {
		method: 'PUT',
		headers,
		url,
		body: input.Body,
	};
};

const putObjectDeserializer = async (
	response: HttpResponse,
): Promise<PutObjectOutput> => {
	if (response.statusCode >= 300) {
		// error is always set when statusCode >= 300
		throw buildStorageServiceError((await parseXmlError(response))!);
	} else {
		return {
			...map(response.headers, {
				ETag: 'etag',
				VersionId: 'x-amz-version-id',
			}),
			$metadata: parseMetadata(response),
		};
	}
};

export const putObject = composeServiceApi(
	s3TransferHandler,
	putObjectSerializer,
	putObjectDeserializer,
	{ ...defaultConfig, responseType: 'text' },
);

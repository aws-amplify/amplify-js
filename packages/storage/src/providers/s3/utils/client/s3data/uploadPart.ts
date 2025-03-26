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
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from '../utils';
import { validateObjectUrl } from '../../validateObjectUrl';

import { defaultConfig, parseXmlError } from './base';
import type { UploadPartCommandInput, UploadPartCommandOutput } from './types';

// Content-length is ignored here because it's forbidden header
// and will be set by browser or fetch polyfill.
export type UploadPartInput = Pick<
	UploadPartCommandInput,
	| 'PartNumber'
	| 'Body'
	| 'UploadId'
	| 'Bucket'
	| 'Key'
	| 'ContentMD5'
	| 'ChecksumCRC32'
	| 'ExpectedBucketOwner'
>;

export type UploadPartOutput = Pick<
	UploadPartCommandOutput,
	'$metadata' | 'ETag'
>;

const uploadPartSerializer = async (
	input: UploadPartInput,
	endpoint: Endpoint,
): Promise<HttpRequest> => {
	const headers = {
		...assignStringVariables({
			'x-amz-checksum-crc32': input.ChecksumCRC32,
			'content-md5': input.ContentMD5,
			'x-amz-expected-bucket-owner': input.ExpectedBucketOwner,
		}),
		'content-type': 'application/octet-stream',
	};
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);
	validateS3RequiredParameter(!!input.PartNumber, 'PartNumber');
	validateS3RequiredParameter(!!input.UploadId, 'UploadId');
	url.search = new AmplifyUrlSearchParams({
		partNumber: input.PartNumber + '',
		uploadId: input.UploadId,
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

const uploadPartDeserializer = async (
	response: HttpResponse,
): Promise<UploadPartOutput> => {
	if (response.statusCode >= 300) {
		// error is always set when statusCode >= 300
		throw buildStorageServiceError((await parseXmlError(response))!);
	} else {
		return {
			...map(response.headers, {
				ETag: 'etag',
			}),
			$metadata: parseMetadata(response),
		};
	}
};

export const uploadPart = composeServiceApi(
	s3TransferHandler,
	uploadPartSerializer,
	uploadPartDeserializer,
	{ ...defaultConfig, responseType: 'text' },
);

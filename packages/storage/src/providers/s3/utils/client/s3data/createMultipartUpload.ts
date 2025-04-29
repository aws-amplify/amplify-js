// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';
import { AmplifyUrl } from '@aws-amplify/core/internals/utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import {
	assignStringVariables,
	buildStorageServiceError,
	map,
	parseXmlBody,
	s3TransferHandler,
	serializeObjectConfigsToHeaders,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from '../utils';
import { validateObjectUrl } from '../../validateObjectUrl';

import type {
	CreateMultipartUploadCommandInput,
	CreateMultipartUploadCommandOutput,
} from './types';
import type { PutObjectInput } from './putObject';
import { defaultConfig, parseXmlError } from './base';

export type CreateMultipartUploadInput = Extract<
	CreateMultipartUploadCommandInput,
	PutObjectInput
>;

export type CreateMultipartUploadOutput = Pick<
	CreateMultipartUploadCommandOutput,
	'UploadId' | '$metadata'
>;

const createMultipartUploadSerializer = async (
	input: CreateMultipartUploadInput,
	endpoint: Endpoint,
): Promise<HttpRequest> => {
	const headers = {
		...(await serializeObjectConfigsToHeaders(input)),
		...assignStringVariables({
			'x-amz-checksum-algorithm': input.ChecksumAlgorithm,
			'x-amz-expected-bucket-owner': input.ExpectedBucketOwner,
		}),
	};
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);
	url.search = 'uploads';
	validateObjectUrl({
		bucketName: input.Bucket,
		key: input.Key,
		objectURL: url,
	});

	return {
		method: 'POST',
		headers,
		url,
	};
};

const createMultipartUploadDeserializer = async (
	response: HttpResponse,
): Promise<CreateMultipartUploadOutput> => {
	if (response.statusCode >= 300) {
		// error is always set when statusCode >= 300
		throw buildStorageServiceError((await parseXmlError(response))!);
	} else {
		const parsed = await parseXmlBody(response);
		const contents = map(parsed, {
			UploadId: 'UploadId',
		});

		return {
			$metadata: parseMetadata(response),
			...contents,
		};
	}
};

export const createMultipartUpload = composeServiceApi(
	s3TransferHandler,
	createMultipartUploadSerializer,
	createMultipartUploadDeserializer,
	{ ...defaultConfig, responseType: 'text' },
);

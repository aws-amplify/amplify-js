// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import {
	AmplifyUrl,
	AmplifyUrlSearchParams,
} from '@aws-amplify/core/internals/utils';
import { MetadataBearer } from '@aws-sdk/types';

import {
	assignStringVariables,
	buildStorageServiceError,
	s3TransferHandler,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from '../utils';
import { validateObjectUrl } from '../../validateObjectUrl';

import type { AbortMultipartUploadCommandInput } from './types';
import { defaultConfig, parseXmlError } from './base';

export type AbortMultipartUploadInput = Pick<
	AbortMultipartUploadCommandInput,
	'Bucket' | 'Key' | 'UploadId' | 'ExpectedBucketOwner'
>;

export type AbortMultipartUploadOutput = MetadataBearer;

const abortMultipartUploadSerializer = (
	input: AbortMultipartUploadInput,
	endpoint: Endpoint,
): HttpRequest => {
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);
	validateS3RequiredParameter(!!input.UploadId, 'UploadId');
	url.search = new AmplifyUrlSearchParams({
		uploadId: input.UploadId,
	}).toString();
	validateObjectUrl({
		bucketName: input.Bucket,
		key: input.Key,
		objectURL: url,
	});
	const headers = {
		...assignStringVariables({
			'x-amz-expected-bucket-owner': input.ExpectedBucketOwner,
		}),
	};

	return {
		method: 'DELETE',
		headers,
		url,
	};
};

const abortMultipartUploadDeserializer = async (
	response: HttpResponse,
): Promise<AbortMultipartUploadOutput> => {
	if (response.statusCode >= 300) {
		const error = (await parseXmlError(response)) as Error;
		throw buildStorageServiceError(error, response.statusCode);
	} else {
		return {
			$metadata: parseMetadata(response),
		};
	}
};

export const abortMultipartUpload = composeServiceApi(
	s3TransferHandler,
	abortMultipartUploadSerializer,
	abortMultipartUploadDeserializer,
	{ ...defaultConfig, responseType: 'text' },
);

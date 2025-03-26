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
	map,
	s3TransferHandler,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from '../utils';
import { validateObjectUrl } from '../../validateObjectUrl';

import type {
	DeleteObjectCommandInput,
	DeleteObjectCommandOutput,
} from './types';
import { defaultConfig, parseXmlError } from './base';

export type DeleteObjectInput = Pick<
	DeleteObjectCommandInput,
	'Bucket' | 'Key' | 'ExpectedBucketOwner'
>;

export type DeleteObjectOutput = DeleteObjectCommandOutput;

const deleteObjectSerializer = (
	input: DeleteObjectInput,
	endpoint: Endpoint,
): HttpRequest => {
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);
	url.search = new AmplifyUrlSearchParams({
		'x-id': 'DeleteObject',
	}).toString();
	validateObjectUrl({
		bucketName: input.Bucket,
		key: input.Key,
		objectURL: url,
	});
	const headers = assignStringVariables({
		'x-amz-expected-bucket-owner': input.ExpectedBucketOwner,
	});

	return {
		method: 'DELETE',
		headers,
		url,
	};
};

const deleteObjectDeserializer = async (
	response: HttpResponse,
): Promise<DeleteObjectOutput> => {
	if (response.statusCode >= 300) {
		// error is always set when statusCode >= 300
		throw buildStorageServiceError((await parseXmlError(response))!);
	} else {
		const content = map(response.headers, {
			DeleteMarker: ['x-amz-delete-marker', deserializeBoolean],
			VersionId: 'x-amz-version-id',
			RequestCharged: 'x-amz-request-charged',
		});

		return {
			...content,
			$metadata: parseMetadata(response),
		};
	}
};

export const deleteObject = composeServiceApi(
	s3TransferHandler,
	deleteObjectSerializer,
	deleteObjectDeserializer,
	{ ...defaultConfig, responseType: 'text' },
);

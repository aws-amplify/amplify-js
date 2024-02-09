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
import { defaultConfig } from './base';
import type { HeadObjectCommandInput, HeadObjectCommandOutput } from './types';

import {
	buildStorageServiceError,
	deserializeMetadata,
	deserializeNumber,
	deserializeTimestamp,
	map,
	parseXmlError,
	s3TransferHandler,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from './utils';
import { StorageError } from '../../../../errors/StorageError';

export type HeadObjectInput = Pick<HeadObjectCommandInput, 'Bucket' | 'Key'>;

export type HeadObjectOutput = Pick<
	HeadObjectCommandOutput,
	| 'ContentLength'
	| 'ContentType'
	| 'ETag'
	| 'LastModified'
	| 'Metadata'
	| 'VersionId'
	| '$metadata'
>;

const headObjectSerializer = async (
	input: HeadObjectInput,
	endpoint: Endpoint
): Promise<HttpRequest> => {
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);
	return {
		method: 'HEAD',
		headers: {},
		url,
	};
};

const headObjectDeserializer = async (
	response: HttpResponse
): Promise<HeadObjectOutput> => {
	if (response.statusCode >= 300) {
		// error is always set when statusCode >= 300
		const error = (await parseXmlError(response)) as Error;
		throw buildStorageServiceError(error, response.statusCode);
	} else {
		const contents = {
			...map(response.headers, {
				ContentLength: ['content-length', deserializeNumber],
				ContentType: 'content-type',
				ETag: 'etag',
				LastModified: ['last-modified', deserializeTimestamp],
				VersionId: 'x-amz-version-id',
			}),
			Metadata: deserializeMetadata(response.headers),
		};
		return {
			$metadata: parseMetadata(response),
			...contents,
		};
	}
};

export const headObject = composeServiceApi(
	s3TransferHandler,
	headObjectSerializer,
	headObjectDeserializer,
	{ ...defaultConfig, responseType: 'text' }
);

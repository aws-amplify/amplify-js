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
import type { PutObjectCommandInput, PutObjectCommandOutput } from './types';
import {
	assignStringVariables,
	buildStorageServiceError,
	map,
	parseXmlError,
	s3TransferHandler,
	serializeObjectConfigsToHeaders,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from './utils';

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
		...assignStringVariables({ 'content-md5': input.ContentMD5 }),
	};
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);

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
		const error = (await parseXmlError(response)) as Error;
		throw buildStorageServiceError(error, response.statusCode);
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

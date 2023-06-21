// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import { defaultConfig } from './base';
import type { UploadPartCommandInput, UploadPartCommandOutput } from './types';
import {
	map,
	parseXmlError,
	s3TransferHandler,
	serializeObjectSsecOptionsToHeaders,
} from './utils';

// Content-length is ignored here because it's forbidden header
// and will be set by browser or fetch polyfill.
export type UploadPartInput = Pick<
	UploadPartCommandInput,
	| 'PartNumber'
	| 'Body'
	| 'UploadId'
	| 'Bucket'
	| 'Key'
	| 'SSECustomerAlgorithm'
	| 'SSECustomerKey'
	| 'SSECustomerKeyMD5'
>;

export type UploadPartOutput = Pick<
	UploadPartCommandOutput,
	'$metadata' | 'ETag'
>;

const uploadPartSerializer = (
	input: UploadPartInput,
	endpoint: Endpoint
): HttpRequest => {
	const headers = {
		...serializeObjectSsecOptionsToHeaders(input),
		'content-type': 'application/octet-stream',
	};
	const url = new URL(endpoint.url.toString());
	url.hostname = `${input.Bucket}.${url.hostname}`;
	url.pathname = `/${input.Key}`;
	url.search = new URLSearchParams({
		partNumber: input.PartNumber + '',
		uploadId: input.UploadId,
	}).toString();
	return {
		method: 'PUT',
		headers,
		url,
		body: input.Body,
	};
};

const uploadPartDeserializer = async (
	response: HttpResponse
): Promise<UploadPartOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseXmlError(response);
		throw error;
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
	{ ...defaultConfig, responseType: 'text' }
);

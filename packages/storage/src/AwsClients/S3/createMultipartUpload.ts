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
	CreateMultipartUploadCommandInput,
	CreateMultipartUploadCommandOutput,
} from './types';
import type { PutObjectInput } from './putObject';

import { defaultConfig } from './base';
import {
	map,
	parseXmlBody,
	parseXmlError,
	s3TransferHandler,
	serializeObjectConfigsToHeaders,
	serializePathnameObjectKey,
} from './utils';

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
	endpoint: Endpoint
): Promise<HttpRequest> => {
	const headers = await serializeObjectConfigsToHeaders(input);
	const url = new URL(endpoint.url.toString());
	url.pathname = serializePathnameObjectKey(url, input.Key);
	url.search = 'uploads';
	return {
		method: 'POST',
		headers,
		url,
	};
};

const createMultipartUploadDeserializer = async (
	response: HttpResponse
): Promise<CreateMultipartUploadOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseXmlError(response);
		throw error;
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
	{ ...defaultConfig, responseType: 'text' }
);

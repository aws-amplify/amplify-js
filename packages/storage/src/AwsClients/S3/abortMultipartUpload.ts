// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';
import { MetadataBearer } from '@aws-sdk/types';
import type { AbortMultipartUploadCommandInput } from './types';

import { defaultConfig } from './base';
import {
	parseXmlError,
	s3TransferHandler,
	serializePathnameObjectKey,
} from './utils';

export type AbortMultipartUploadInput = Pick<
	AbortMultipartUploadCommandInput,
	'Bucket' | 'Key' | 'UploadId'
>;

export type AbortMultipartUploadOutput = MetadataBearer;

const abortMultipartUploadSerializer = (
	input: AbortMultipartUploadInput,
	endpoint: Endpoint
): HttpRequest => {
	const url = new URL(endpoint.url.toString());
	url.pathname = serializePathnameObjectKey(url, input.Key);
	url.search = new URLSearchParams({
		uploadId: input.UploadId,
	}).toString();
	return {
		method: 'DELETE',
		headers: {},
		url,
	};
};

const abortMultipartUploadDeserializer = async (
	response: HttpResponse
): Promise<AbortMultipartUploadOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseXmlError(response);
		throw error;
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
	{ ...defaultConfig, responseType: 'text' }
);

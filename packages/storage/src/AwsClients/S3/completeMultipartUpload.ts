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
	CompleteMultipartUploadCommandInput,
	CompleteMultipartUploadCommandOutput,
	CompletedMultipartUpload,
	CompletedPart,
} from './types';
import { defaultConfig } from './base';
import {
	map,
	parseXmlBody,
	parseXmlError,
	s3TransferHandler,
	serializeObjectSsecOptionsToHeaders,
} from './utils';

const INVALID_PARAMETER_ERROR_MSG =
	'Invalid parameter for ComplteMultipartUpload API';

export type CompleteMultipartUploadInput = Pick<
	CompleteMultipartUploadCommandInput,
	| 'Bucket'
	| 'Key'
	| 'UploadId'
	| 'MultipartUpload'
	| 'SSECustomerAlgorithm'
	| 'SSECustomerKey'
	| 'SSECustomerKeyMD5'
>;

export type CompleteMultipartUploadOutput = Pick<
	CompleteMultipartUploadCommandOutput,
	'$metadata' | 'Key' | 'ETag' | 'Location'
>;

const completeMultipartUploadSerializer = (
	input: CompleteMultipartUploadInput,
	endpoint: Endpoint
): HttpRequest => {
	const headers = serializeObjectSsecOptionsToHeaders(input);
	const url = new URL(endpoint.url.toString());
	url.hostname = `${input.Bucket}.${url.hostname}`;
	url.pathname = `/${input.Key}`;
	url.search = new URLSearchParams({ uploadId: input.UploadId }).toString();
	return {
		method: 'POST',
		headers,
		url,
		body:
			'<?xml version="1.0" encoding="UTF-8"?>' +
			serializeCompletedMultipartUpload(input.MultipartUpload),
	};
};

const serializeCompletedMultipartUpload = (
	input: CompletedMultipartUpload
): string =>
	`<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${(
		input.Parts ?? []
	)
		.map(serializeCompletedPartList)
		.join('')}</CompleteMultipartUpload>`;

const serializeCompletedPartList = (input: CompletedPart): string => {
	if (!input.ETag || input.PartNumber == null) {
		throw new Error(`${INVALID_PARAMETER_ERROR_MSG}: ${input}`);
	}
	return `<Part><ETag>${input.ETag}</ETag><PartNumber>${input.PartNumber}</PartNumber></Part>`;
};

const completeMultipartUploadDeserializer = async (
	response: HttpResponse
): Promise<CompleteMultipartUploadOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseXmlError(response);
		throw error;
	} else {
		const parsed = await parseXmlBody(response);
		const contents = map(parsed, {
			ETag: 'ETag',
			Key: 'Key',
			Location: 'Location',
		});
		return {
			$metadata: parseMetadata(response),
			...contents,
		};
	}
};

export const completeMultipartUpload = composeServiceApi(
	s3TransferHandler,
	completeMultipartUploadSerializer,
	completeMultipartUploadDeserializer,
	{ ...defaultConfig, responseType: 'text' }
);

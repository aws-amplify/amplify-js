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

import type { AbortMultipartUploadCommandInput } from './types';
import { defaultConfig } from './base';
import {
	buildStorageServiceError,
	parseXmlError,
	s3TransferHandler,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from './utils';

export type AbortMultipartUploadInput = Pick<
	AbortMultipartUploadCommandInput,
	'Bucket' | 'Key' | 'UploadId'
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

	return {
		method: 'DELETE',
		headers: {},
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

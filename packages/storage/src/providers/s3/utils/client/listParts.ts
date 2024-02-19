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

import type {
	CompletedPart,
	ListPartsCommandInput,
	ListPartsCommandOutput,
} from './types';
import { defaultConfig } from './base';
import {
	buildStorageServiceError,
	deserializeNumber,
	emptyArrayGuard,
	map,
	parseXmlBody,
	parseXmlError,
	s3TransferHandler,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from './utils';

export type ListPartsInput = Pick<
	ListPartsCommandInput,
	'Bucket' | 'Key' | 'UploadId'
>;

export type ListPartsOutput = Pick<
	ListPartsCommandOutput,
	'Parts' | 'UploadId' | '$metadata'
>;

const listPartsSerializer = async (
	input: ListPartsInput,
	endpoint: Endpoint,
): Promise<HttpRequest> => {
	const headers = {};
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);
	validateS3RequiredParameter(!!input.UploadId, 'UploadId');
	url.search = new AmplifyUrlSearchParams({
		uploadId: input.UploadId,
	}).toString();

	return {
		method: 'GET',
		headers,
		url,
	};
};

const listPartsDeserializer = async (
	response: HttpResponse,
): Promise<ListPartsOutput> => {
	if (response.statusCode >= 300) {
		const error = (await parseXmlError(response)) as Error;
		throw buildStorageServiceError(error, response.statusCode);
	} else {
		const parsed = await parseXmlBody(response);
		const contents = map(parsed, {
			UploadId: 'UploadId',
			Parts: [
				'Part',
				value => emptyArrayGuard(value, deserializeCompletedPartList),
			],
		});

		return {
			$metadata: parseMetadata(response),
			...contents,
		};
	}
};

const deserializeCompletedPartList = (input: any[]): CompletedPart[] =>
	input.map(item =>
		map(item, {
			PartNumber: ['PartNumber', deserializeNumber],
			ETag: 'ETag',
			Size: ['Size', deserializeNumber],
		}),
	);

export const listParts = composeServiceApi(
	s3TransferHandler,
	listPartsSerializer,
	listPartsDeserializer,
	{ ...defaultConfig, responseType: 'text' },
);

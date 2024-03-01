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

import type { CopyObjectCommandInput, CopyObjectCommandOutput } from './types';
import { defaultConfig } from './base';
import {
	assignStringVariables,
	buildStorageServiceError,
	parseXmlBody,
	parseXmlError,
	s3TransferHandler,
	serializeObjectConfigsToHeaders,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from './utils';

export type CopyObjectInput = Pick<
	CopyObjectCommandInput,
	| 'Bucket'
	| 'CopySource'
	| 'Key'
	| 'MetadataDirective'
	| 'CacheControl'
	| 'ContentType'
	| 'ContentDisposition'
	| 'ContentLanguage'
	| 'Expires'
	| 'ACL'
	| 'Tagging'
	| 'Metadata'
>;

export type CopyObjectOutput = CopyObjectCommandOutput;

const copyObjectSerializer = async (
	input: CopyObjectInput,
	endpoint: Endpoint,
): Promise<HttpRequest> => {
	const headers = {
		...(await serializeObjectConfigsToHeaders(input)),
		...assignStringVariables({
			'x-amz-copy-source': input.CopySource,
			'x-amz-metadata-directive': input.MetadataDirective,
		}),
	};
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);

	return {
		method: 'PUT',
		headers,
		url,
	};
};

const copyObjectDeserializer = async (
	response: HttpResponse,
): Promise<CopyObjectOutput> => {
	if (response.statusCode >= 300) {
		const error = (await parseXmlError(response)) as Error;
		throw buildStorageServiceError(error, response.statusCode);
	} else {
		await parseXmlBody(response);

		return {
			$metadata: parseMetadata(response),
		};
	}
};

export const copyObject = composeServiceApi(
	s3TransferHandler,
	copyObjectSerializer,
	copyObjectDeserializer,
	{ ...defaultConfig, responseType: 'text' },
);

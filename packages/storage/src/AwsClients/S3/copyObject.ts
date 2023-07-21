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
import type { CopyObjectCommandInput } from './types';
import { defaultConfig } from './base';
import {
	assignStringVariables,
	parseXmlBody,
	parseXmlError,
	s3TransferHandler,
	serializeObjectConfigsToHeaders,
	serializePathnameObjectKey,
} from './utils';
import type { S3ProviderCopyConfig } from '../../types/AWSS3Provider';

/**
 * @see {@link S3ProviderCopyConfig}
 */
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
	| 'ServerSideEncryption'
	| 'SSECustomerAlgorithm'
	| 'SSECustomerKey'
	// TODO(AllanZhengYP): remove in V6.
	| 'SSECustomerKeyMD5'
	| 'SSEKMSKeyId'
	| 'Tagging'
	| 'Metadata'
>;

export type CopyObjectOutput = MetadataBearer;

const copyObjectSerializer = async (
	input: CopyObjectInput,
	endpoint: Endpoint
): Promise<HttpRequest> => {
	const headers = {
		...(await serializeObjectConfigsToHeaders(input)),
		...assignStringVariables({
			'x-amz-copy-source': input.CopySource,
			'x-amz-metadata-directive': input.MetadataDirective,
		}),
	};
	const url = new URL(endpoint.url.toString());
	url.pathname = serializePathnameObjectKey(url, input.Key);
	return {
		method: 'PUT',
		headers,
		url,
	};
};

const copyObjectDeserializer = async (
	response: HttpResponse
): Promise<CopyObjectOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseXmlError(response);
		throw error;
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
	{ ...defaultConfig, responseType: 'text' }
);

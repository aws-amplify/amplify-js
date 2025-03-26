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

import {
	assignStringVariables,
	bothNilOrEqual,
	buildStorageServiceError,
	parseXmlBody,
	s3TransferHandler,
	serializeObjectConfigsToHeaders,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from '../utils';
import { IntegrityError } from '../../../../../errors/IntegrityError';
import { validateObjectUrl } from '../../validateObjectUrl';

import type { CopyObjectCommandInput, CopyObjectCommandOutput } from './types';
import { defaultConfig, parseXmlError } from './base';

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
	| 'CopySourceIfUnmodifiedSince'
	| 'CopySourceIfMatch'
	| 'ExpectedSourceBucketOwner'
	| 'ExpectedBucketOwner'
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
			'x-amz-copy-source-if-match': input.CopySourceIfMatch,
			'x-amz-copy-source-if-unmodified-since':
				input.CopySourceIfUnmodifiedSince?.toUTCString(),
			'x-amz-source-expected-bucket-owner': input.ExpectedSourceBucketOwner,
			'x-amz-expected-bucket-owner': input.ExpectedBucketOwner,
		}),
	};
	validateCopyObjectHeaders(input, headers);
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);
	url.search = new AmplifyUrlSearchParams({
		'x-id': 'CopyObject',
	}).toString();
	validateObjectUrl({
		bucketName: input.Bucket,
		key: input.Key,
		objectURL: url,
	});

	return {
		method: 'PUT',
		headers,
		url,
	};
};

export const validateCopyObjectHeaders = (
	input: CopyObjectInput,
	headers: Record<string, string>,
) => {
	const validations: boolean[] = [
		headers['x-amz-copy-source'] === input.CopySource,
		bothNilOrEqual(
			input.MetadataDirective,
			headers['x-amz-metadata-directive'],
		),
		bothNilOrEqual(
			input.CopySourceIfMatch,
			headers['x-amz-copy-source-if-match'],
		),
		bothNilOrEqual(
			input.CopySourceIfUnmodifiedSince?.toUTCString(),
			headers['x-amz-copy-source-if-unmodified-since'],
		),
	];

	if (validations.some(validation => !validation)) {
		throw new IntegrityError();
	}
};

const copyObjectDeserializer = async (
	response: HttpResponse,
): Promise<CopyObjectOutput> => {
	if (response.statusCode >= 300) {
		// error is always set when statusCode >= 300
		throw buildStorageServiceError((await parseXmlError(response))!);
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

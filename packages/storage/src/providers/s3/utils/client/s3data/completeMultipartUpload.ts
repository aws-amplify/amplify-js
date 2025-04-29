// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	Endpoint,
	HttpRequest,
	HttpResponse,
	MiddlewareContext,
	RetryDeciderOutput,
	parseMetadata,
} from '@aws-amplify/core/internals/aws-client-utils';
import {
	AmplifyUrl,
	AmplifyUrlSearchParams,
} from '@aws-amplify/core/internals/utils';
import { composeServiceApi } from '@aws-amplify/core/internals/aws-client-utils/composers';

import {
	assignStringVariables,
	buildStorageServiceError,
	map,
	parseXmlBody,
	s3TransferHandler,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from '../utils';
import { validateObjectUrl } from '../../validateObjectUrl';
import { validateMultipartUploadXML } from '../../validateMultipartUploadXML';

import { defaultConfig, parseXmlError, retryDecider } from './base';
import type {
	CompleteMultipartUploadCommandInput,
	CompleteMultipartUploadCommandOutput,
	CompletedMultipartUpload,
	CompletedPart,
} from './types';

const INVALID_PARAMETER_ERROR_MSG =
	'Invalid parameter for CompleteMultipartUpload API';

const MISSING_ETAG_ERROR_MSG = 'ETag missing from multipart upload';
const MISSING_ETAG_ERROR_SUGGESTION =
	'Please ensure S3 bucket CORS configuration includes ETag as part of its `ExposeHeaders` element';

export type CompleteMultipartUploadInput = Pick<
	CompleteMultipartUploadCommandInput,
	| 'Bucket'
	| 'Key'
	| 'UploadId'
	| 'MultipartUpload'
	| 'ChecksumCRC32'
	| 'ExpectedBucketOwner'
	| 'IfNoneMatch'
>;

export type CompleteMultipartUploadOutput = Pick<
	CompleteMultipartUploadCommandOutput,
	'$metadata' | 'Key' | 'ETag' | 'Location'
>;

const completeMultipartUploadSerializer = async (
	input: CompleteMultipartUploadInput,
	endpoint: Endpoint,
): Promise<HttpRequest> => {
	const headers = {
		'content-type': 'application/xml',
		...assignStringVariables({
			'x-amz-checksum-crc32': input.ChecksumCRC32,
			'x-amz-expected-bucket-owner': input.ExpectedBucketOwner,
			'If-None-Match': input.IfNoneMatch,
		}),
	};
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);
	validateS3RequiredParameter(!!input.UploadId, 'UploadId');
	url.search = new AmplifyUrlSearchParams({
		uploadId: input.UploadId,
	}).toString();
	validateS3RequiredParameter(!!input.MultipartUpload, 'MultipartUpload');
	validateObjectUrl({
		bucketName: input.Bucket,
		key: input.Key,
		objectURL: url,
	});

	const xml = serializeCompletedMultipartUpload(input.MultipartUpload);
	validateMultipartUploadXML(input.MultipartUpload, xml);

	return {
		method: 'POST',
		headers,
		url,
		body: '<?xml version="1.0" encoding="UTF-8"?>' + xml,
	};
};

const serializeCompletedMultipartUpload = (
	input: CompletedMultipartUpload,
): string => {
	if (!input.Parts?.length) {
		throw new Error(`${INVALID_PARAMETER_ERROR_MSG}: ${JSON.stringify(input)}`);
	}

	return `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${input.Parts.map(
		serializeCompletedPartList,
	).join('')}</CompleteMultipartUpload>`;
};

const serializeCompletedPartList = (input: CompletedPart): string => {
	if (input.PartNumber == null) {
		throw new Error(`${INVALID_PARAMETER_ERROR_MSG}: ${JSON.stringify(input)}`);
	}
	if (!input.ETag) {
		throw new Error(
			`${MISSING_ETAG_ERROR_MSG}: ${JSON.stringify(input)}. ${MISSING_ETAG_ERROR_SUGGESTION}`,
		);
	}

	const eTag = `<ETag>${input.ETag}</ETag>`;
	const partNumber = `<PartNumber>${input.PartNumber}</PartNumber>`;
	const checksumCRC32 = input.ChecksumCRC32
		? `<ChecksumCRC32>${input.ChecksumCRC32}</ChecksumCRC32>`
		: '';

	return `<Part>${eTag}${partNumber}${checksumCRC32}</Part>`;
};

/**
 * Parse CompleteMultipartUpload API response payload, which may be empty or error indicating internal
 * server error, even when the status code is 200.
 *
 * Ref: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html#API_CompleteMultipartUpload_Example_4
 */
const parseXmlBodyOrThrow = async (response: HttpResponse): Promise<any> => {
	const parsed = await parseXmlBody(response); // Handles empty body case
	if (parsed.Code !== undefined && parsed.Message !== undefined) {
		const error = await parseXmlError({
			...response,
			statusCode: 500, // To workaround the >=300 status code check common to other APIs.
		});
		error!.$metadata.httpStatusCode = response.statusCode;
		throw buildStorageServiceError(error!);
	}

	return parsed;
};

const completeMultipartUploadDeserializer = async (
	response: HttpResponse,
): Promise<CompleteMultipartUploadOutput> => {
	if (response.statusCode >= 300) {
		// error is always set when statusCode >= 300
		throw buildStorageServiceError((await parseXmlError(response))!);
	} else {
		const parsed = await parseXmlBodyOrThrow(response);
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

// CompleteMultiPartUpload API returns 200 status code with empty body or error message.
// This indicates internal server error after the response has been sent to the client.
// Ref: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html#API_CompleteMultipartUpload_Example_4
const retryWhenErrorWith200StatusCode = async (
	response?: HttpResponse,
	error?: unknown,
	middlewareContext?: MiddlewareContext,
): Promise<RetryDeciderOutput> => {
	if (!response) {
		return { retryable: false };
	}
	if (response.statusCode === 200) {
		if (!response.body) {
			return { retryable: true };
		}
		const parsed = await parseXmlBody(response);
		if (parsed.Code !== undefined && parsed.Message !== undefined) {
			return { retryable: true };
		}

		return { retryable: false };
	}

	return retryDecider(response, error, middlewareContext);
};

export const completeMultipartUpload = composeServiceApi(
	s3TransferHandler,
	completeMultipartUploadSerializer,
	completeMultipartUploadDeserializer,
	{
		...defaultConfig,
		responseType: 'text',
		retryDecider: retryWhenErrorWith200StatusCode,
	},
);

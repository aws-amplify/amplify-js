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
	CompleteMultipartUploadCommandInput,
	CompleteMultipartUploadCommandOutput,
	CompletedMultipartUpload,
	CompletedPart,
} from './types';
import { defaultConfig } from './base';
import {
	buildStorageServiceError,
	map,
	parseXmlBody,
	parseXmlError,
	s3TransferHandler,
	serializePathnameObjectKey,
	validateS3RequiredParameter,
} from './utils';

const INVALID_PARAMETER_ERROR_MSG =
	'Invalid parameter for ComplteMultipartUpload API';

export type CompleteMultipartUploadInput = Pick<
	CompleteMultipartUploadCommandInput,
	'Bucket' | 'Key' | 'UploadId' | 'MultipartUpload'
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
	};
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Key, 'Key');
	url.pathname = serializePathnameObjectKey(url, input.Key);
	validateS3RequiredParameter(!!input.UploadId, 'UploadId');
	url.search = new AmplifyUrlSearchParams({
		uploadId: input.UploadId,
	}).toString();
	validateS3RequiredParameter(!!input.MultipartUpload, 'MultipartUpload');

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
	input: CompletedMultipartUpload,
): string => {
	if (!input.Parts?.length) {
		throw new Error(`${INVALID_PARAMETER_ERROR_MSG}: ${input}`);
	}

	return `<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${input.Parts.map(
		serializeCompletedPartList,
	).join('')}</CompleteMultipartUpload>`;
};

const serializeCompletedPartList = (input: CompletedPart): string => {
	if (!input.ETag || input.PartNumber == null) {
		throw new Error(`${INVALID_PARAMETER_ERROR_MSG}: ${input}`);
	}

	return `<Part><ETag>${input.ETag}</ETag><PartNumber>${input.PartNumber}</PartNumber></Part>`;
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
		const error = (await parseXmlError({
			...response,
			statusCode: 500, // To workaround the >=300 status code check common to other APIs.
		})) as Error;
		throw buildStorageServiceError(error, response.statusCode);
	}

	return parsed;
};

const completeMultipartUploadDeserializer = async (
	response: HttpResponse,
): Promise<CompleteMultipartUploadOutput> => {
	if (response.statusCode >= 300) {
		const error = (await parseXmlError(response)) as Error;
		throw buildStorageServiceError(error, response.statusCode);
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
): Promise<boolean> => {
	if (!response) {
		return false;
	}
	if (response.statusCode === 200) {
		if (!response.body) {
			return true;
		}
		const parsed = await parseXmlBody(response);
		if (parsed.Code !== undefined && parsed.Message !== undefined) {
			return true;
		}

		return false;
	}

	const defaultRetryDecider = defaultConfig.retryDecider;

	return defaultRetryDecider(response, error);
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

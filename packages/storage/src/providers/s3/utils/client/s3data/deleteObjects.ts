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
	buildStorageServiceError,
	s3TransferHandler,
	validateS3RequiredParameter,
} from '../utils';
import { generateDeleteObjectsXml } from '../../generateDeleteObjectsXml';
import { calculateContentMd5 } from '../../md5';

import type {
	DeleteObjectsCommandInput,
	DeleteObjectsCommandOutput,
} from './types';
import { defaultConfig, parseXmlError } from './base';

export type DeleteObjectsInput = Pick<
	DeleteObjectsCommandInput,
	'Bucket' | 'Delete' | 'ExpectedBucketOwner'
> & {
	ContentMD5?: string;
};

export type DeleteObjectsOutput = DeleteObjectsCommandOutput;

const deleteObjectsSerializer = async (
	input: DeleteObjectsInput,
	endpoint: Endpoint,
): Promise<HttpRequest> => {
	const url = new AmplifyUrl(endpoint.url.toString());
	validateS3RequiredParameter(!!input.Delete, 'Delete');
	url.pathname = '/';
	url.search = new AmplifyUrlSearchParams({
		delete: '',
	}).toString();

	const body = generateDeleteObjectsXml(
		input.Delete!.Objects,
		input.Delete!.Quiet ?? false,
	);

	const contentMd5 = input.ContentMD5 ?? (await calculateContentMd5(body));

	const headers = assignStringVariables({
		'x-amz-expected-bucket-owner': input.ExpectedBucketOwner,
		'content-type': 'application/xml',
		'content-md5': contentMd5,
	});

	const request = {
		method: 'POST',
		headers,
		url,
		body,
	};

	return request;
};

const deleteObjectsDeserializer = async (
	response: HttpResponse,
): Promise<DeleteObjectsOutput> => {
	if (response.statusCode >= 300) {
		const error = await parseXmlError(response);
		throw buildStorageServiceError(error!);
	}

	const text = await response.body.text();

	const deleted: { Key?: string }[] = [];
	const errors: { Key?: string; Code?: string; Message?: string }[] = [];

	const deletedMatches = text.matchAll(/<Deleted>[\s\S]*?<\/Deleted>/g);
	for (const match of deletedMatches) {
		const keyMatch = match[0].match(/<Key>(.*?)<\/Key>/);
		if (keyMatch) {
			deleted.push({ Key: keyMatch[1] });
		}
	}

	const errorMatches = text.matchAll(/<Error>[\s\S]*?<\/Error>/g);
	for (const match of errorMatches) {
		const keyMatch = match[0].match(/<Key>(.*?)<\/Key>/);
		const codeMatch = match[0].match(/<Code>(.*?)<\/Code>/);
		const messageMatch = match[0].match(/<Message>(.*?)<\/Message>/);

		errors.push({
			Key: keyMatch?.[1],
			Code: codeMatch?.[1],
			Message: messageMatch?.[1],
		});
	}

	const result = {
		Deleted: deleted,
		Errors: errors,
		$metadata: parseMetadata(response),
	};

	return result;
};

export const deleteObjects = composeServiceApi(
	s3TransferHandler,
	deleteObjectsSerializer,
	deleteObjectsDeserializer,
	{ ...defaultConfig, responseType: 'text' },
);

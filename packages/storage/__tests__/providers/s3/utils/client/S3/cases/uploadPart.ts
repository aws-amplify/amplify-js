// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { uploadPart } from '../../../../../../../src/providers/s3/utils/client/s3data';
import { ApiFunctionalTestCase } from '../../testUtils/types';

import {
	DEFAULT_RESPONSE_HEADERS,
	defaultConfig,
	expectedMetadata,
} from './shared';

// API reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_UploadPart.html
const uploadPartHappyCase: ApiFunctionalTestCase<typeof uploadPart> = [
	'happy case',
	'uploadPart',
	uploadPart,
	defaultConfig,
	{
		Bucket: 'bucket',
		Key: 'key',
		Body: 'body',
		PartNumber: 1,
		UploadId: 'uploadId',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3.us-east-1.amazonaws.com/key?partNumber=1&uploadId=uploadId',
		}),
		method: 'PUT',
		headers: expect.objectContaining({
			'content-type': 'application/octet-stream', // required by RN Android if body exists
		}),
		body: 'body',
	}),
	{
		status: 200,
		headers: { ...DEFAULT_RESPONSE_HEADERS, etag: 'etag' },
		body: '',
	},
	{
		$metadata: expect.objectContaining(expectedMetadata),
		ETag: 'etag',
	},
];

const uploadPartHappyCaseCustomEndpoint: ApiFunctionalTestCase<
	typeof uploadPart
> = [
	'happy case',
	'uploadPart with custom endpoint',
	uploadPart,
	{
		...defaultConfig,
		customEndpoint: 'custom.endpoint.com',
		forcePathStyle: true,
	},
	{
		Bucket: 'bucket',
		Key: 'key',
		PartNumber: 1,
		UploadId: 'uploadId',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://custom.endpoint.com/bucket/key?partNumber=1&uploadId=uploadId',
		}),
	}),
	{
		status: 200,
		headers: { ...DEFAULT_RESPONSE_HEADERS, etag: 'etag' },
		body: '',
	},
	expect.objectContaining({
		/**	skip validating response */
	}) as any,
];

export default [uploadPartHappyCase, uploadPartHappyCaseCustomEndpoint];

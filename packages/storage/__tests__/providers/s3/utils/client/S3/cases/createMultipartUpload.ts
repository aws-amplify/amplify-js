// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMultipartUpload } from '../../../../../../../src/providers/s3/utils/client/s3data';
import { ApiFunctionalTestCase } from '../../testUtils/types';

import {
	DEFAULT_RESPONSE_HEADERS,
	defaultConfig,
	expectedMetadata,
} from './shared';
import { expectedPutObjectRequestHeaders, putObjectRequest } from './putObject';

// API reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateMultipartUpload.html
const createMultiPartUploadHappyCase: ApiFunctionalTestCase<
	typeof createMultipartUpload
> = [
	'happy case',
	'createMultipartUpload',
	createMultipartUpload,
	defaultConfig,
	putObjectRequest, // CreateMultipartUpload has same input as putObject API.
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3.us-east-1.amazonaws.com/key?uploads',
		}),
		method: 'POST',
		headers: expect.objectContaining(expectedPutObjectRequestHeaders),
	}),
	{
		status: 200,
		headers: { ...DEFAULT_RESPONSE_HEADERS },
		body: `<InitiateMultipartUploadResult>
		<Bucket>string</Bucket>
		<Key>string</Key>
		<UploadId>string</UploadId>
	 </InitiateMultipartUploadResult>`,
	},
	{
		$metadata: expect.objectContaining(expectedMetadata),
		UploadId: 'string',
	},
];

const createMultiPartUploadHappyCaseCustomEndpoint: ApiFunctionalTestCase<
	typeof createMultipartUpload
> = [
	'happy case',
	'createMultipartUpload with custom endpoint',
	createMultipartUpload,
	{
		...defaultConfig,
		customEndpoint: 'custom.endpoint.com',
		forcePathStyle: true,
	},
	putObjectRequest,
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://custom.endpoint.com/bucket/key?uploads',
		}),
	}),
	{
		status: 200,
		headers: { ...DEFAULT_RESPONSE_HEADERS },
		body: '',
	},
	expect.objectContaining({
		/**	skip validating response */
	}) as any,
];

export default [
	createMultiPartUploadHappyCase,
	createMultiPartUploadHappyCaseCustomEndpoint,
];

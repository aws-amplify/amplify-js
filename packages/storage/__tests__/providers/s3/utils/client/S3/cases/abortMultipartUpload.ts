// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { abortMultipartUpload } from '../../../../../../../src/providers/s3/utils/client/s3data';
import { ApiFunctionalTestCase } from '../../testUtils/types';

import {
	DEFAULT_RESPONSE_HEADERS,
	defaultConfig,
	expectedMetadata,
} from './shared';

// API Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_AbortMultipartUpload.html
const abortMultipartUploadHappyCase: ApiFunctionalTestCase<
	typeof abortMultipartUpload
> = [
	'happy case',
	'abortMultipartUpload',
	abortMultipartUpload,
	defaultConfig,
	{
		Bucket: 'bucket',
		Key: 'key',
		UploadId: 'uploadId',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3.us-east-1.amazonaws.com/key?uploadId=uploadId',
		}),
		method: 'DELETE',
	}),
	{
		status: 204,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: '',
	},
	{
		$metadata: expect.objectContaining({
			...expectedMetadata,
			httpStatusCode: 204,
		}),
	},
];

const abortMultipartUploadHappyCaseCustomEndpoint: ApiFunctionalTestCase<
	typeof abortMultipartUpload
> = [
	'happy case',
	'abortMultipartUpload with custom endpoint',
	abortMultipartUpload,
	{
		...defaultConfig,
		customEndpoint: 'custom.endpoint.com',
		forcePathStyle: true,
	},
	{
		Bucket: 'bucket',
		Key: 'key',
		UploadId: 'uploadId',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://custom.endpoint.com/bucket/key?uploadId=uploadId',
		}),
	}),
	{
		status: 204,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: '',
	},
	expect.objectContaining({
		/**	skip validating response */
	}) as any,
];

export default [
	abortMultipartUploadHappyCase,
	abortMultipartUploadHappyCaseCustomEndpoint,
];

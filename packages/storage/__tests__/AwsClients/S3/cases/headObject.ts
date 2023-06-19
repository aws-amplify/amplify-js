// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { headObject } from '../../../../src/AwsClients/S3';
import { ApiFunctionalTestCase } from '../../testUtils/types';
import {
	defaultConfig,
	DEFAULT_RESPONSE_HEADERS,
	expectedMetadata,
} from './shared';

// API Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadObject.html
const headObjectHappyCase: ApiFunctionalTestCase<typeof headObject> = [
	'happy case',
	'headObject',
	headObject,
	defaultConfig,
	{
		Bucket: 'bucket',
		Key: 'key',
		SSECustomerAlgorithm: 'sseCustomerAlgorithm',
		SSECustomerKey: 'sseCustomerKey',
		SSECustomerKeyMD5: 'sseCustomerKeyMD5',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3.us-east-1.amazonaws.com/key',
		}),
		method: 'HEAD',
		headers: expect.objectContaining({
			'x-amz-server-side-encryption-customer-algorithm': 'sseCustomerAlgorithm',
			'x-amz-server-side-encryption-customer-key': 'sseCustomerKey',
			'x-amz-server-side-encryption-customer-key-md5': 'sseCustomerKeyMD5',
		}),
	}),
	{
		status: 200,
		headers: {
			...DEFAULT_RESPONSE_HEADERS,
			'content-length': '434234',
			'content-type': 'text/plain',
			etag: 'etag',
			'last-modified': 'Sun, 1 Jan 2006 12:00:00 GMT',
			'x-amz-version-id': 'versionId',
		},
		body: '',
	},
	{
		$metadata: expect.objectContaining(expectedMetadata),
		ContentLength: 434234,
		ContentType: 'text/plain',
		ETag: 'etag',
		LastModified: new Date('Sun, 1 Jan 2006 12:00:00 GMT'),
		VersionId: 'versionId',
	},
];

export default [headObjectHappyCase];

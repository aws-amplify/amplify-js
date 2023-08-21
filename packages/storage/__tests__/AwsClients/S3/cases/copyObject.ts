// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { copyObject } from '../../../../src/AwsClients/S3';
import { toBase64 } from '../../../../src/AwsClients/S3/utils';
import { ApiFunctionalTestCase } from '../../testUtils/types';
import {
	defaultConfig,
	DEFAULT_RESPONSE_HEADERS,
	expectedMetadata,
} from './shared';

// API Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CopyObject.html
const copyObjectHappyCase: ApiFunctionalTestCase<typeof copyObject> = [
	'happy case',
	'copyObject',
	copyObject,
	defaultConfig,
	{
		Bucket: 'bucket',
		CopySource: 'sourceBucket/sourceKey',
		Key: 'key',
		CacheControl: 'cacheControl',
		ContentType: 'contentType',
		ACL: 'acl',
		ServerSideEncryption: 'serverSideEncryption',
		SSECustomerAlgorithm: 'sseCustomerAlgorithm',
		SSECustomerKey: 'SSECustomerKey',
		SSECustomerKeyMD5: 'sseCustomerKeyMD5',
		SSEKMSKeyId: 'sseKMSKeyId',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3.us-east-1.amazonaws.com/key',
		}),
		method: 'PUT',
		headers: expect.objectContaining({
			'x-amz-copy-source': 'sourceBucket/sourceKey',
			'cache-control': 'cacheControl',
			'content-type': 'contentType',
			'x-amz-acl': 'acl',
			'x-amz-server-side-encryption': 'serverSideEncryption',
			'x-amz-server-side-encryption-customer-algorithm': 'sseCustomerAlgorithm',
			'x-amz-server-side-encryption-customer-key': toBase64('SSECustomerKey'),
			'x-amz-server-side-encryption-customer-key-md5':
				'u2yTVQWmqQ+XbBDNNmwr4Q==',
			'x-amz-server-side-encryption-aws-kms-key-id': 'sseKMSKeyId',
		}),
	}),
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body:
			'<CopyObjectResult>' +
			'<ETag>599bab3ed2c697f1d26842727561fd94</ETag>' +
			'<LastModified>2013-09-17T18:07:53.000Z</LastModified>' +
			'<ChecksumCRC32>string</ChecksumCRC32>' +
			'<ChecksumCRC32C>string</ChecksumCRC32C>' +
			'<ChecksumSHA1>string</ChecksumSHA1>' +
			'<ChecksumSHA256>string</ChecksumSHA256>' +
			'</CopyObjectResult>',
	},
	{
		$metadata: expect.objectContaining(expectedMetadata),
		ETag: '599bab3ed2c697f1d26842727561fd94',
		LastModified: new Date('2013-09-17T18:07:53.000Z'),
	},
];

export default [copyObjectHappyCase];

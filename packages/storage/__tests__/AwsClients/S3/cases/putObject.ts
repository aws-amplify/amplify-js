// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { putObject } from '../../../../src/AwsClients/S3';
import { ApiFunctionalTestCase } from '../../testUtils/types';
import {
	defaultConfig,
	DEFAULT_RESPONSE_HEADERS,
	expectedMetadata,
} from './shared';

const putObjectRequest = {
	Bucket: 'bucket',
	Key: 'key',
	Body: 'body',
	ServerSideEncryption: 'ServerSideEncryption',
	SSECustomerAlgorithm: 'SSECustomerAlgorithm',
	SSECustomerKey: 'SSECustomerKey',
	SSECustomerKeyMD5: 'SSECustomerKeyMD5',
	SSEKMSKeyId: 'SSEKMSKeyId',
	ACL: 'public-read',
	CacheControl: 'CacheControl',
	ContentDisposition: 'ContentDisposition',
	ContentEncoding: 'ContentEncoding',
	ContentType: 'ContentType',
	Expires: new Date('2020-01-01'),
	Metadata: {
		Param1: 'value 1',
	},
	Tagging: 'Tagging',
};

const expectedPutObjectRequestHeaders = {
	'x-amz-server-side-encryption': 'ServerSideEncryption',
	'x-amz-server-side-encryption-customer-algorithm': 'SSECustomerAlgorithm',
	'x-amz-server-side-encryption-customer-key': 'SSECustomerKey',
	'x-amz-server-side-encryption-customer-key-md5': 'SSECustomerKeyMD5',
	'x-amz-server-side-encryption-aws-kms-key-id': 'SSEKMSKeyId',
	'x-amz-acl': 'public-read',
	'cache-control': 'CacheControl',
	'content-disposition': 'ContentDisposition',
	'content-encoding': 'ContentEncoding',
	'content-type': 'ContentType',
	expires: 'Wed, 01 Jan 2020 00:00:00 GMT',
	'x-amz-tagging': 'Tagging',
	'x-amz-meta-param1': 'value 1',
};

const putObjectHappyCase: ApiFunctionalTestCase<typeof putObject> = [
	'happy case',
	'putObject',
	putObject,
	defaultConfig,
	putObjectRequest,
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3.us-east-1.amazonaws.com/key',
		}),
		headers: expect.objectContaining(expectedPutObjectRequestHeaders),
		body: 'body',
	}),
	{
		status: 200,
		headers: {
			...DEFAULT_RESPONSE_HEADERS,
			'x-amz-version-id': 'versionId',
			etag: 'etag',
		},
		body: '',
	},
	{
		$metadata: expect.objectContaining(expectedMetadata),
		ETag: 'etag',
		VersionId: 'versionId',
	},
];

export default [putObjectHappyCase];

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { uploadPart } from '../../../../src/AwsClients/S3';
import { toBase64 } from '../../../../src/AwsClients/S3/utils';
import { ApiFunctionalTestCase } from '../../testUtils/types';
import { defaultConfig, DEFAULT_RESPONSE_HEADERS, expectedMetadata } from './shared';

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
		SSECustomerAlgorithm: 'SSECustomerAlgorithm',
		SSECustomerKey: 'SSECustomerKey',
		SSECustomerKeyMD5: 'SSECustomerKeyMD5',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3.us-east-1.amazonaws.com/key?partNumber=1&uploadId=uploadId',
		}),
		method: 'PUT',
		headers: expect.objectContaining({
			'x-amz-server-side-encryption-customer-algorithm': 'SSECustomerAlgorithm',
			'x-amz-server-side-encryption-customer-key': toBase64('SSECustomerKey'),
			'x-amz-server-side-encryption-customer-key-md5': 'u2yTVQWmqQ+XbBDNNmwr4Q==',
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

export default [uploadPartHappyCase];

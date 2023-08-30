// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { completeMultipartUpload } from '../../../../../../../src/providers/s3/utils/client';
import { ApiFunctionalTestCase } from '../../testUtils/types';
import {
	defaultConfig,
	DEFAULT_RESPONSE_HEADERS,
	expectedMetadata,
} from './shared';

// API reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html
const completeMultipartUploadHappyCase: ApiFunctionalTestCase<
	typeof completeMultipartUpload
> = [
	'happy case',
	'completeMultipartUpload',
	completeMultipartUpload,
	defaultConfig,
	{
		Bucket: 'bucket',
		Key: 'key',
		MultipartUpload: {
			Parts: [
				{
					ETag: 'etag1',
					PartNumber: 1,
				},
				{
					ETag: 'etag2',
					PartNumber: 2,
				},
			],
		},
		UploadId: 'uploadId',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3.us-east-1.amazonaws.com/key?uploadId=uploadId',
		}),
		method: 'POST',
		headers: expect.objectContaining({
			'content-type': 'application/xml',
		}),
		body:
			'<?xml version="1.0" encoding="UTF-8"?>' +
			'<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/">' +
			'<Part>' +
			'<ETag>etag1</ETag>' +
			'<PartNumber>1</PartNumber>' +
			'</Part>' +
			'<Part>' +
			'<ETag>etag2</ETag>' +
			'<PartNumber>2</PartNumber>' +
			'</Part>' +
			'</CompleteMultipartUpload>',
	}),
	{
		status: 200,
		headers: { ...DEFAULT_RESPONSE_HEADERS },
		body:
			'<?xml version="1.0" encoding="UTF-8"?>' +
			'<CompleteMultipartUploadResult>' +
			'<Location>location</Location>' +
			'<Key>key</Key>' +
			'<ETag>etag</ETag>' +
			'</CompleteMultipartUploadResult>',
	},
	{
		$metadata: expect.objectContaining(expectedMetadata),
		Location: 'location',
		Key: 'key',
		ETag: 'etag',
	},
];

// API reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CompleteMultipartUpload.html
const completeMultipartUploadErrorCase: ApiFunctionalTestCase<
	typeof completeMultipartUpload
> = [
	'error case',
	'completeMultipartUpload',
	completeMultipartUpload,
	defaultConfig,
	completeMultipartUploadHappyCase[4],
	completeMultipartUploadHappyCase[5],
	{
		status: 403,
		headers: DEFAULT_RESPONSE_HEADERS,
		body:
			'<?xml version="1.0" encoding="UTF-8"?>' +
			'<Error>' +
			'<Code>AccessDenied</Code>' +
			'<Message>Access Denied</Message>' +
			'<RequestId>656c76696e6727732072657175657374</RequestId>' +
			'<HostId>Uuag1LuByRx9e6j5Onimru9pO4ZVKnJ2Qz7/C1NPcfTWAtRPfTaOFg==</HostId>' +
			'</Error>',
	},
	{
		message: 'Access Denied',
		name: 'AccessDenied',
	},
];

const completeMultipartUploadErrorWith200CodeCase: ApiFunctionalTestCase<
	typeof completeMultipartUpload
> = [
	'error case',
	'completeMultipartUpload with 200 status',
	completeMultipartUpload,
	{ ...defaultConfig, retryDecider: async () => false }, // disable retry
	completeMultipartUploadHappyCase[4],
	completeMultipartUploadHappyCase[5],
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body:
			'<?xml version="1.0" encoding="UTF-8"?>' +
			'<Error>' +
			'<Code>InternalError</Code>' +
			'<Message>We encountered an internal error. Please try again.</Message>' +
			'<RequestId>656c76696e6727732072657175657374</RequestId>' +
			'<HostId>Uuag1LuByRx9e6j5Onimru9pO4ZVKnJ2Qz7/C1NPcfTWAtRPfTaOFg==</HostId>' +
			'</Error>',
	},
	{
		message: 'We encountered an internal error. Please try again.',
		name: 'InternalError',
	},
];

export default [
	completeMultipartUploadHappyCase,
	completeMultipartUploadErrorCase,
	completeMultipartUploadErrorWith200CodeCase,
];

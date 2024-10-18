// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { listParts } from '../../../../../../../src/providers/s3/utils/client/s3data';
import { ApiFunctionalTestCase } from '../../testUtils/types';

import {
	DEFAULT_RESPONSE_HEADERS,
	defaultConfig,
	expectedMetadata,
} from './shared';

// API Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListParts.html
const listPartsHappyCase: ApiFunctionalTestCase<typeof listParts> = [
	'happy case',
	'listParts',
	listParts,
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
		method: 'GET',
	}),
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body:
			'<?xml version="1.0" encoding="UTF-8"?>' +
			'<ListPartsResult>' +
			'<UploadId>uploadId</UploadId>' +
			'<Part>' +
			'<PartNumber>1</PartNumber>' +
			'<ETag>etag1</ETag>' +
			'<Size>5242880</Size>' +
			'<ChecksumCRC32>checksum1</ChecksumCRC32>' +
			'</Part>' +
			'<Part>' +
			'<PartNumber>2</PartNumber>' +
			'<ETag>etag2</ETag>' +
			'<Size>1024</Size>' +
			'<ChecksumCRC32>checksum2</ChecksumCRC32>' +
			'</Part>' +
			'</ListPartsResult>',
	},
	{
		$metadata: expect.objectContaining(expectedMetadata),
		UploadId: 'uploadId',
		Parts: [
			{
				PartNumber: 1,
				ETag: 'etag1',
				ChecksumCRC32: 'checksum1',
			},
			{
				PartNumber: 2,
				ETag: 'etag2',
				ChecksumCRC32: 'checksum2',
			},
		],
	},
];

export default [listPartsHappyCase];

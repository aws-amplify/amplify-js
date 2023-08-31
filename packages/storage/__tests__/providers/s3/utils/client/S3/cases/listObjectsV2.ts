// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { listObjectsV2 } from '../../../../../../../src/providers/s3/utils/client';
import { ApiFunctionalTestCase } from '../../testUtils/types';
import {
	defaultConfig,
	defaultRequiredRequestHeaders,
	DEFAULT_RESPONSE_HEADERS,
	expectedMetadata,
} from './shared';

// API Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html
const listObjectsV2HappyCase: ApiFunctionalTestCase<typeof listObjectsV2> = [
	'happy case',
	'listObjectsV2',
	listObjectsV2,
	defaultConfig,
	{
		Bucket: 'bucket',
		ContinuationToken: 'ContinuationToken',
		Delimiter: 'Delimiter',
		EncodingType: 'EncodingType',
		ExpectedBucketOwner: 'ExpectedBucketOwner',
		FetchOwner: false,
		MaxKeys: 0,
		Prefix: 'Prefix',
		RequestPayer: 'RequestPayer',
		StartAfter: 'StartAfter',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3.us-east-1.amazonaws.com/?list-type=2&continuation-token=ContinuationToken&delimiter=Delimiter&encoding-type=EncodingType&fetch-owner=false&max-keys=0&prefix=Prefix&start-after=StartAfter',
		}),
		method: 'GET',
		headers: expect.objectContaining({
			...defaultRequiredRequestHeaders,
			'x-amz-request-payer': 'RequestPayer',
			'x-amz-expected-bucket-owner': 'ExpectedBucketOwner',
		}),
	}),
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: `<?xml version="1.0" encoding="UTF-8"?>
		<ListBucketResult>
		<Name>bucket</Name>
		<Prefix/>
		<KeyCount>205</KeyCount>
		<StartAfter>ExampleGuide.pdf</StartAfter>
		<MaxKeys>1000</MaxKeys>
		<IsTruncated>false</IsTruncated>
		<EncodingType>string</EncodingType>
		<ContinuationToken>1ueGcxLPRx1Tr/XYExHnhbYLgveDs2J/wm36Hy4vbOwM=</ContinuationToken>
		<NextContinuationToken>Next1ueGcxLPRx1Tr/XYExHnhbYLgveDs2J/wm36Hy4vbOwM=</NextContinuationToken>
		<Contents>
		 <Key>ExampleObject.txt</Key>
		 <LastModified>2013-09-17T18:07:53.000Z</LastModified>
		 <ETag>"599bab3ed2c697f1d26842727561fd94"</ETag>
		 <Size>857</Size>
		 <StorageClass>REDUCED_REDUNDANCY</StorageClass>
	 </Contents>
		<Contents>
		 <Key>my-image.jpg</Key>
		 <LastModified>2009-10-12T17:50:30.000Z</LastModified>
		 <ETag>"fba9dede5f27731c9771645a39863328"</ETag>
		 <Size>434234</Size>
		 <StorageClass>STANDARD</StorageClass>
		 <Owner>
			 <ID>8a6925ce4a7f21c32aa379004fef</ID>
			 <DisplayName>string</DisplayName>
		 </Owner>
		</Contents>
		<Delimiter>string</Delimiter>
		<CommonPrefixes>
			<Prefix>photos/2006/February/</Prefix>
		</CommonPrefixes>
		<CommonPrefixes>
			<Prefix>photos/2006/January/</Prefix>
		</CommonPrefixes>
 </ListBucketResult>`,
	},
	{
		CommonPrefixes: [
			{
				Prefix: 'photos/2006/February/',
			},
			{
				Prefix: 'photos/2006/January/',
			},
		],
		Contents: [
			{
				ETag: '"599bab3ed2c697f1d26842727561fd94"',
				Key: 'ExampleObject.txt',
				LastModified: new Date('2013-09-17T18:07:53.000Z'),
				Size: 857,
				StorageClass: 'REDUCED_REDUNDANCY',
			},
			{
				ETag: '"fba9dede5f27731c9771645a39863328"',
				Key: 'my-image.jpg',
				LastModified: new Date('2009-10-12T17:50:30.000Z'),
				Size: 434234,
				StorageClass: 'STANDARD',
				Owner: {
					ID: '8a6925ce4a7f21c32aa379004fef',
					DisplayName: 'string',
				},
			},
		],
		ContinuationToken: '1ueGcxLPRx1Tr/XYExHnhbYLgveDs2J/wm36Hy4vbOwM=',
		Delimiter: 'string',
		EncodingType: 'string',
		IsTruncated: false,
		KeyCount: 205,
		MaxKeys: 1000,
		Name: 'bucket',
		NextContinuationToken: 'Next1ueGcxLPRx1Tr/XYExHnhbYLgveDs2J/wm36Hy4vbOwM=',
		Prefix: '',
		StartAfter: 'ExampleGuide.pdf',
		$metadata: expect.objectContaining(expectedMetadata),
	},
];

const listObjectsV2ErrorCase: ApiFunctionalTestCase<typeof listObjectsV2> = [
	'error case',
	'listObjectsV2',
	listObjectsV2,
	defaultConfig,
	listObjectsV2HappyCase[4],
	listObjectsV2HappyCase[5],
	{
		status: 403,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: `<?xml version="1.0" encoding="UTF-8"?>
		<Error>
			<Code>NoSuchKey</Code>
			<Message>The resource you requested does not exist</Message>
			<Resource>/mybucket/myfoto.jpg</Resource> 
			<RequestId>4442587FB7D0A2F9</RequestId>
		</Error>`,
	},
	{
		message: 'The resource you requested does not exist',
		name: 'NoSuchKey',
	},
];

export default [listObjectsV2HappyCase, listObjectsV2ErrorCase];

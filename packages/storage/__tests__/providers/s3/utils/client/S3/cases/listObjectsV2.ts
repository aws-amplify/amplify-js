// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { listObjectsV2 } from '../../../../../../../src/providers/s3/utils/client/s3data';
import { ApiFunctionalTestCase } from '../../testUtils/types';

import {
	DEFAULT_RESPONSE_HEADERS,
	defaultConfig,
	expectedMetadata,
} from './shared';

// API Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html
const listObjectsV2HappyCaseTruncated: ApiFunctionalTestCase<
	typeof listObjectsV2
> = [
	'happy case',
	'listObjectsV2 - truncated',
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
		<KeyCount>4</KeyCount>
		<StartAfter>ExampleGuide.pdf</StartAfter>
		<MaxKeys>1000</MaxKeys>
		<IsTruncated>true</IsTruncated>
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
		IsTruncated: true,
		KeyCount: 4,
		MaxKeys: 1000,
		Name: 'bucket',
		NextContinuationToken: 'Next1ueGcxLPRx1Tr/XYExHnhbYLgveDs2J/wm36Hy4vbOwM=',
		Prefix: '',
		StartAfter: 'ExampleGuide.pdf',
		$metadata: expect.objectContaining(expectedMetadata),
	},
];

const listObjectsV2HappyCaseComplete: ApiFunctionalTestCase<
	typeof listObjectsV2
> = [
	listObjectsV2HappyCaseTruncated[0],
	'listObjectsV2 - complete',
	listObjectsV2HappyCaseTruncated[2],
	listObjectsV2HappyCaseTruncated[3],
	listObjectsV2HappyCaseTruncated[4],
	listObjectsV2HappyCaseTruncated[5],
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: `<?xml version="1.0" encoding="UTF-8"?>
		<ListBucketResult>
		<Name>bucket</Name>
		<Prefix/>
		<KeyCount>4</KeyCount>
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
		KeyCount: 4,
		Name: 'bucket',
		Prefix: '',
		$metadata: expect.objectContaining(expectedMetadata),
	},
];

const listObjectsV2ErrorCase403: ApiFunctionalTestCase<typeof listObjectsV2> = [
	'error case',
	'listObjectsV2 - 403',
	listObjectsV2,
	defaultConfig,
	listObjectsV2HappyCaseTruncated[4],
	listObjectsV2HappyCaseTruncated[5],
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

const listObjectsV2ErrorCaseKeyCount: ApiFunctionalTestCase<
	typeof listObjectsV2
> = [
	listObjectsV2ErrorCase403[0],
	'listObjectsV2 - key count mismatch',
	listObjectsV2ErrorCase403[2],
	listObjectsV2ErrorCase403[3],
	listObjectsV2ErrorCase403[4],
	listObjectsV2ErrorCase403[5],
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: `<?xml version="1.0" encoding="UTF-8"?>
		<ListBucketResult>
		<Name>bucket</Name>
		<Prefix/>
		<KeyCount>5</KeyCount>
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
		<CommonPrefixes>
			<Prefix>photos/2006/February/</Prefix>
		</CommonPrefixes>
		<CommonPrefixes>
			<Prefix>photos/2006/January/</Prefix>
		</CommonPrefixes>
 </ListBucketResult>`,
	},
	{
		message: 'An unknown error has occurred.',
		name: 'Unknown',
	},
];

const listObjectsV2ErrorCaseMissingToken: ApiFunctionalTestCase<
	typeof listObjectsV2
> = [
	listObjectsV2ErrorCase403[0],
	'listObjectsV2 - missing next continuation token',
	listObjectsV2ErrorCase403[2],
	listObjectsV2ErrorCase403[3],
	listObjectsV2ErrorCase403[4],
	listObjectsV2ErrorCase403[5],
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: `<?xml version="1.0" encoding="UTF-8"?>
		<ListBucketResult>
		<Name>bucket</Name>
		<Prefix/>
		<KeyCount>5</KeyCount>
		<IsTruncated>true</IsTruncated>
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
		<CommonPrefixes>
			<Prefix>photos/2006/February/</Prefix>
		</CommonPrefixes>
		<CommonPrefixes>
			<Prefix>photos/2006/January/</Prefix>
		</CommonPrefixes>
 </ListBucketResult>`,
	},
	{
		message: 'An unknown error has occurred.',
		name: 'Unknown',
	},
];

const listObjectsV2ErrorCaseMissingTruncated: ApiFunctionalTestCase<
	typeof listObjectsV2
> = [
	listObjectsV2ErrorCase403[0],
	'listObjectsV2 - missing truncated',
	listObjectsV2ErrorCase403[2],
	listObjectsV2ErrorCase403[3],
	listObjectsV2ErrorCase403[4],
	listObjectsV2ErrorCase403[5],
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: `<?xml version="1.0" encoding="UTF-8"?>
		<ListBucketResult>
		<Name>bucket</Name>
		<Prefix/>
		<KeyCount>5</KeyCount>
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
		<CommonPrefixes>
			<Prefix>photos/2006/February/</Prefix>
		</CommonPrefixes>
		<CommonPrefixes>
			<Prefix>photos/2006/January/</Prefix>
		</CommonPrefixes>
 </ListBucketResult>`,
	},
	{
		message: 'An unknown error has occurred.',
		name: 'Unknown',
	},
];

const listObjectsV2HappyCaseCustomEndpoint: ApiFunctionalTestCase<
	typeof listObjectsV2
> = [
	'happy case',
	'listObjectsV2 with custom endpoint',
	listObjectsV2,
	{
		...defaultConfig,
		customEndpoint: 'custom.endpoint.com',
		forcePathStyle: true,
	},
	{
		Bucket: 'bucket',
		Prefix: 'Prefix',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://custom.endpoint.com/bucket?list-type=2&prefix=Prefix',
		}),
	}),
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: `<?xml version="1.0" encoding="UTF-8"?>
		<ListBucketResult>
		<Name>bucket</Name>
		<Prefix/>
		<KeyCount>1</KeyCount>
		<MaxKeys>1000</MaxKeys>
		<IsTruncated>false</IsTruncated>
		<Contents>
		 <Key>ExampleObject.txt</Key>
		 <LastModified>2013-09-17T18:07:53.000Z</LastModified>
		 <ETag>"599bab3ed2c697f1d26842727561fd94"</ETag>
		 <Size>857</Size>
		 <StorageClass>REDUCED_REDUNDANCY</StorageClass>
	    </Contents>
		</ListBucketResult>`,
	},
	expect.objectContaining({
		/**	skip validating response */
	}) as any,
];

const listObjectsV2HappyCaseWithEncoding: ApiFunctionalTestCase<
	typeof listObjectsV2
> = [
	'happy case',
	'listObjectsV2 unicode values with encoding',
	listObjectsV2,
	{
		...defaultConfig,
	},
	{
		Bucket: 'bucket',
		Prefix: 'Prefix',
		EncodingType: 'url',
	},
	expect.any(Object),
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: `<?xml version="1.0" encoding="UTF-8"?>
	<ListBucketResult
	xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
	<Name>bucket</Name>
	<Prefix>some%20folder%20with%20%00%20unprintable%20unicode%2F</Prefix>
		<Delimiter>bad%08key</Delimiter>
	<StartAfter>bad%01key</StartAfter>
	<KeyCount>6</KeyCount>
	<MaxKeys>101</MaxKeys>
	<EncodingType>url</EncodingType>
	<IsTruncated>false</IsTruncated>
	<Contents>
		<Key>public/bad%3Cdiv%3Ekey</Key>
		<LastModified>2024-11-05T18:13:11.000Z</LastModified>
		<ETag>&quot;c0e066cc5238dd7937e464fe7572b71a&quot;</ETag>
		<Size>5455</Size>
		<StorageClass>STANDARD</StorageClass>
	</Contents>
		<Contents>
		<Key>bad%00key</Key>
		<LastModified>2024-11-05T18:13:11.000Z</LastModified>
		<ETag>&quot;c0e066cc5238dd7937e464fe7572b71a&quot;</ETag>
		<Size>5455</Size>
		<StorageClass>STANDARD</StorageClass>
	</Contents>
		<Contents>
		<Key>public/bad%7Fkey</Key>
		<LastModified>2024-11-05T18:13:11.000Z</LastModified>
		<ETag>&quot;c0e066cc5238dd7937e464fe7572b71a&quot;</ETag>
		<Size>5455</Size>
		<StorageClass>STANDARD</StorageClass>
	</Contents>
	<CommonPrefixes>
		<Prefix>public/some%20folder%20with%20spaces%2F</Prefix>
	</CommonPrefixes>
	<CommonPrefixes>
		<Prefix>public/real%0A%0A%0A%0A%0A%0A%0A%0A%0Afunny%0A%0A%0A%0A%0A%0A%0A%0A%0Abiz%2F</Prefix>
	</CommonPrefixes>
	<CommonPrefixes>
		<Prefix>public/some%20folder%20with%20%E3%81%8A%E3%81%AF%E3%82%88%E3%81%86%20multibyte%20unicode%2F</Prefix>
	</CommonPrefixes>
</ListBucketResult>`,
	},
	expect.objectContaining({
		CommonPrefixes: [
			{
				Prefix: 'public/some%20folder%20with%20spaces%2F',
			},
			{
				Prefix:
					'public/real%0A%0A%0A%0A%0A%0A%0A%0A%0Afunny%0A%0A%0A%0A%0A%0A%0A%0A%0Abiz%2F',
			},
			{
				Prefix:
					'public/some%20folder%20with%20%E3%81%8A%E3%81%AF%E3%82%88%E3%81%86%20multibyte%20unicode%2F',
			},
		],
		Contents: [
			{
				Key: 'public/bad%3Cdiv%3Ekey',
				LastModified: new Date('2024-11-05T18:13:11.000Z'),
				ETag: '"c0e066cc5238dd7937e464fe7572b71a"',
				Size: 5455,
				StorageClass: 'STANDARD',
			},
			{
				Key: 'bad%00key',
				LastModified: new Date('2024-11-05T18:13:11.000Z'),
				ETag: '"c0e066cc5238dd7937e464fe7572b71a"',
				Size: 5455,
				StorageClass: 'STANDARD',
			},
			{
				Key: 'public/bad%7Fkey',
				LastModified: new Date('2024-11-05T18:13:11.000Z'),
				ETag: '"c0e066cc5238dd7937e464fe7572b71a"',
				Size: 5455,
				StorageClass: 'STANDARD',
			},
		],
		Prefix: 'some%20folder%20with%20%00%20unprintable%20unicode%2F',
		Delimiter: 'bad%08key',
		StartAfter: 'bad%01key',
		EncodingType: 'url',
		Name: 'bucket',
	}) as any,
];

const listObjectsV2ErrorCaseNoEncoding: ApiFunctionalTestCase<
	typeof listObjectsV2
> = [
	'error case',
	'listObjectsV2 unicode values without encoding',
	listObjectsV2,
	{
		...defaultConfig,
	},
	{
		Bucket: 'bucket',
		Prefix: 'Prefix',
		EncodingType: undefined,
	},
	expect.any(Object),
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: `<?xml version="1.0" encoding="UTF-8"?>
	<ListBucketResult
	xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
	<Name>badname</Name>
	<Prefix>bad\x01key</Prefix>
	<KeyCount>5</KeyCount>
	<MaxKeys>101</MaxKeys>
	<Delimiter>bad\x08key</Delimiter>
	<IsTruncated>false</IsTruncated>
	<StartAfter>おはよう multibyte unicode</StartAfter>
	<Contents>
		<Key>public/bad<div>key</Key>
		<LastModified>2024-11-05T18:13:11.000Z</LastModified>
		<ETag>&quot;c0e066cc5238dd7937e464fe7572b71a&quot;</ETag>
		<Size>5455</Size>
		<StorageClass>STANDARD</StorageClass>
	</Contents>
		<Contents>
		<Key>bad\x00key</Key>
		<LastModified>2024-11-05T18:13:11.000Z</LastModified>
		<ETag>&quot;c0e066cc5238dd7937e464fe7572b71a&quot;</ETag>
		<Size>5455</Size>
		<StorageClass>STANDARD</StorageClass>
	</Contents>
		<Contents>
		<Key>public/bad\x7fkey</Key>
		<LastModified>2024-11-05T18:13:11.000Z</LastModified>
		<ETag>&quot;c0e066cc5238dd7937e464fe7572b71a&quot;</ETag>
		<Size>5455</Size>
		<StorageClass>STANDARD</StorageClass>
	</Contents>
	<CommonPrefixes>
		<Prefix>public/some folder with spaces/</Prefix>
	</CommonPrefixes>
	<CommonPrefixes>
		<Prefix>public/some folder with \x00 unprintable unicode/</Prefix>
	</CommonPrefixes>
</ListBucketResult>`,
	},
	{
		message: 'An unknown error has occurred.',
		name: 'Unknown',
	},
];

export default [
	listObjectsV2HappyCaseTruncated,
	listObjectsV2HappyCaseComplete,
	listObjectsV2HappyCaseCustomEndpoint,
	listObjectsV2ErrorCaseKeyCount,
	listObjectsV2ErrorCaseMissingTruncated,
	listObjectsV2ErrorCaseMissingToken,
	listObjectsV2ErrorCase403,
	listObjectsV2HappyCaseWithEncoding,
	listObjectsV2ErrorCaseNoEncoding,
];

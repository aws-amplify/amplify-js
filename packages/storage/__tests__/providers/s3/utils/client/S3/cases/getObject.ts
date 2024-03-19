// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getObject } from '../../../../../../../src/providers/s3/utils/client';
import { toBase64 } from '../../../../../../../src/providers/s3/utils/client/utils';
import { ApiFunctionalTestCase } from '../../testUtils/types';
import {
	defaultConfig,
	DEFAULT_RESPONSE_HEADERS,
	expectedMetadata,
	EMPTY_SHA256,
} from './shared';

const getObjectResponseHeaders = {
	'x-amz-delete-marker': 'true',
	'accept-ranges': 'types',
	'x-amz-expiration':
		'expiry-date="Fri, 23 Dec 2012 00:00:00 GMT", rule-id="picture-deletion-rule"',
	'x-amz-restore':
		'ongoing-request="false", expiry-date="Fri, 21 Dec 2012 00:00:00 GMT"', // Ref: https://docs.aws.amazon.com/AmazonS3/latest/API/API_HeadObject.html#AmazonS3-HeadObject-response-header-Restore
	'last-modified': 'Sun, 1 Jan 2006 12:00:00 GMT',
	'content-length': '434234',
	etag: 'fba9dede5f27731c9771645a39863328',
	'x-amz-checksum-crc32': '696e1637',
	'x-amz-checksum-crc32c': '028A5A90',
	'x-amz-checksum-sha1': '5f3446f6cb2f4962082dfe2d298d1b1a32a21b21',
	'x-amz-checksum-sha256':
		'1643577c036c1e057505b4dce59f3d34bd3fe6224f1064c80dd5426b27a12360',
	'x-amz-missing-meta': '2',
	'x-amz-version-id': '3HL4kqtJlcpXroDTDmjVBH40Nrjfkd',
	'cache-control': 'no-store',
	'content-disposition': 'attachment',
	'content-encoding': 'zip',
	'content-language': 'en-US',
	'content-range': 'bytes 0-9/443',
	'content-type': 'text/plain',
	expires: 'Thu, 01 Dec 1994 16:00:00 GMT',
	'x-amz-website-redirect-location': 'http://www.example.com/',
	'x-amz-server-side-encryption': 'aws:kms',
	'x-amz-server-side-encryption-customer-algorithm': 'AES256',
	'x-amz-server-side-encryption-customer-key-md5': 'ZjQrne1X/iTcskbY2m3example',
	'x-amz-server-side-encryption-aws-kms-key-id': '12345keyId',
	'x-amz-server-side-encryption-bucket-key-enabled': 'true',
	'x-amz-storage-class': 'STANDARD',
	'x-amz-request-charged': 'requester',
	'x-amz-replication-status': 'COMPLETE',
	'x-amz-mp-parts-count': '100',
	'x-amz-tagging-count': '100',
	'x-amz-object-lock-mode': 'COMPLIANCE',
	'x-amz-object-lock-retain-until-date': 'Fri, 23 Dec 2012 00:00:00 GMT',
	'x-amz-object-lock-legal-hold': 'ON',
	// metadata
	'x-amz-meta-param1': 'value 1',
	'x-amz-meta-param2': 'value 2',
} as const;

export const expectedGetObjectUrl =
	'https://bucket.s3.us-east-1.amazonaws.com/key';

// API Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetObject.html
const getObjectHappyCase: ApiFunctionalTestCase<typeof getObject> = [
	'happy case',
	'getObject',
	getObject,
	defaultConfig,
	{
		Bucket: 'bucket',
		Key: 'key',
		Range: 'bytes=1-100',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: expectedGetObjectUrl,
		}),
		method: 'GET',
		headers: expect.objectContaining({
			Range: 'bytes=1-100',
		}),
	}),
	{
		status: 200,
		// all header names are already lowercased by transfer handlers
		headers: {
			...DEFAULT_RESPONSE_HEADERS,
			...getObjectResponseHeaders,
		},
		body: 'mockBody',
	},
	{
		DeleteMarker: true,
		AcceptRanges: 'types',
		Expiration: getObjectResponseHeaders['x-amz-expiration'],
		Restore: getObjectResponseHeaders['x-amz-restore'],
		LastModified: new Date(getObjectResponseHeaders['last-modified']),
		ContentLength: Number(getObjectResponseHeaders['content-length']),
		ETag: getObjectResponseHeaders.etag,
		ChecksumCRC32: getObjectResponseHeaders['x-amz-checksum-crc32'],
		ChecksumCRC32C: getObjectResponseHeaders['x-amz-checksum-crc32c'],
		ChecksumSHA1: getObjectResponseHeaders['x-amz-checksum-sha1'],
		ChecksumSHA256: getObjectResponseHeaders['x-amz-checksum-sha256'],
		MissingMeta: Number(getObjectResponseHeaders['x-amz-missing-meta']),
		VersionId: getObjectResponseHeaders['x-amz-version-id'],
		CacheControl: getObjectResponseHeaders['cache-control'],
		ContentDisposition: getObjectResponseHeaders['content-disposition'],
		ContentEncoding: getObjectResponseHeaders['content-encoding'],
		ContentLanguage: getObjectResponseHeaders['content-language'],
		ContentRange: getObjectResponseHeaders['content-range'],
		ContentType: getObjectResponseHeaders['content-type'],
		Expires: new Date(getObjectResponseHeaders.expires),
		WebsiteRedirectLocation:
			getObjectResponseHeaders['x-amz-website-redirect-location'],
		ServerSideEncryption:
			getObjectResponseHeaders['x-amz-server-side-encryption'],
		SSECustomerAlgorithm:
			getObjectResponseHeaders[
				'x-amz-server-side-encryption-customer-algorithm'
			],
		SSECustomerKeyMD5:
			getObjectResponseHeaders['x-amz-server-side-encryption-customer-key-md5'],
		SSEKMSKeyId:
			getObjectResponseHeaders['x-amz-server-side-encryption-aws-kms-key-id'],
		BucketKeyEnabled: true,
		StorageClass: getObjectResponseHeaders['x-amz-storage-class'],
		RequestCharged: getObjectResponseHeaders['x-amz-request-charged'],
		ReplicationStatus: getObjectResponseHeaders['x-amz-replication-status'],
		PartsCount: Number(getObjectResponseHeaders['x-amz-mp-parts-count']),
		TagCount: Number(getObjectResponseHeaders['x-amz-tagging-count']),
		ObjectLockMode: getObjectResponseHeaders['x-amz-object-lock-mode'],
		ObjectLockRetainUntilDate: new Date(
			getObjectResponseHeaders['x-amz-object-lock-retain-until-date'],
		),
		ObjectLockLegalHoldStatus:
			getObjectResponseHeaders['x-amz-object-lock-legal-hold'],
		Metadata: {
			param1: 'value 1',
			param2: 'value 2',
		},
		Body: expect.objectContaining({
			text: expect.any(Function),
			blob: expect.any(Function),
			json: expect.any(Function),
		}),
		$metadata: expect.objectContaining(expectedMetadata),
	},
];

const getObjectAccelerateEndpoint: ApiFunctionalTestCase<typeof getObject> = [
	'happy case',
	'getObject with accelerate endpoint',
	getObject,
	{
		...defaultConfig,
		useAccelerateEndpoint: true,
	} as Parameters<typeof getObject>[0],
	{
		Bucket: 'bucket',
		Key: 'key',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3-accelerate.amazonaws.com/key',
		}),
	}),
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: 'mockBody',
	},
	expect.objectContaining({
		/**	skip validating response */
	}) as any,
];

const getObjectCustomEndpoint: ApiFunctionalTestCase<typeof getObject> = [
	'happy case',
	'getObject with custom endpoint',
	getObject,
	{
		...defaultConfig,
		customEndpoint: 'https://custom.endpoint.com',
		forcePathStyle: true,
	} as Parameters<typeof getObject>[0],
	{
		Bucket: 'bucket',
		Key: 'key',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://custom.endpoint.com/bucket/key',
		}),
	}),
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: 'mockBody',
	},
	expect.objectContaining({
		/**	skip validating response */
	}) as any,
];

export default [
	getObjectHappyCase,
	getObjectAccelerateEndpoint,
	getObjectCustomEndpoint,
];

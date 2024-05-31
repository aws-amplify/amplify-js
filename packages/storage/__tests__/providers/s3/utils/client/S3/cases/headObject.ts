// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { headObject } from '../../../../../../../src/providers/s3/utils/client';
import { ApiFunctionalTestCase } from '../../testUtils/types';

import {
	DEFAULT_RESPONSE_HEADERS,
	defaultConfig,
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
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3.us-east-1.amazonaws.com/key',
		}),
		method: 'HEAD',
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

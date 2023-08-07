// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getProperties } from '../../../src/providers/s3';

jest.mock('../../../src/AwsClients/S3');
const headObject = jest.fn();

test.skip('getProperties API happy path case', async () => {
	// TODO test credentials
	headObject.mockImplementation(() => {
		return {
			Key: 'key',
			ContentLength: '100',
			ContentType: 'text/plain',
			ETag: 'etag',
			LastModified: 'last-modified',
			Metadata: { key: 'value' },
		};
	});
	const metadata = { key: 'value' };
	expect(await getProperties({ key: 'key' })).toEqual({
		key: 'key',
		contentLength: '100',
		contentType: 'text/plain',
		eTag: 'etag',
		lastModified: 'last-modified',
		metadata,
	});
});

test.skip('getProperties API should return a not found error', async () => {
	// TODO test credentials
	headObject.mockImplementation(() =>
		Object.assign(new Error(), {
			$metadata: { httpStatusCode: 404 },
			name: 'NotFound',
		})
	);
	try {
		await getProperties({ key: 'invalid_key' });
	} catch (error) {
		console.log('Error testing', error);
		expect(error.$metadata?.httpStatusCode).toBe(404);
	}
});

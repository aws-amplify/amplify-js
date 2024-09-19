// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import { createCopyObjectSerializer } from '../../../../../../../../src/foundation/factories/serviceClients/s3/s3data/shared/serde';

describe('createCopyObjectSerializer', () => {
	it('should serialize copyObject request', async () => {
		const input = {
			Bucket: 'bucket',
			CopySource: 'sourceBucket/sourceKey',
			Key: 'mykey',
			CacheControl: 'cacheControl',
			ContentType: 'contentType',
			ACL: 'acl',
		};
		const endPointUrl = 'http://test.com';
		const endpoint = { url: new AmplifyUrl(endPointUrl) };

		const serializer = createCopyObjectSerializer();
		const result = await serializer(input, endpoint);

		expect(result).toEqual({
			url: expect.objectContaining({
				href: `${endPointUrl}/${input.Key}`,
			}),
			method: 'PUT',
			headers: expect.objectContaining({
				'x-amz-copy-source': 'sourceBucket/sourceKey',
				'cache-control': 'cacheControl',
				'content-type': 'contentType',
				'x-amz-acl': 'acl',
			}),
		});
	});
});

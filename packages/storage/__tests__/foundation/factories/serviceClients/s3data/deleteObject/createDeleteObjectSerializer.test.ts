// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyUrl } from '@aws-amplify/core/internals/utils';

import { createDeleteObjectSerializer } from '../../../../../../src/foundation/factories/serviceClients/s3data/deleteObject/createDeleteObjectSerializer';

describe('createDeleteObjectSerializer', () => {
	it('should serialize deleteObject request', async () => {
		const input = { Bucket: 'bucket', Key: 'myKey' };
		const endPointUrl = 'http://test.com';
		const endpoint = { url: new AmplifyUrl(endPointUrl) };

		const serializer = createDeleteObjectSerializer();
		const result = serializer(input, endpoint);

		expect(result).toEqual({
			method: 'DELETE',
			headers: {},
			url: expect.objectContaining({
				href: `${endPointUrl}/${input.Key}`,
			}),
		});
	});
});

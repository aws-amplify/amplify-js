// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '@aws-amplify/core/internals/aws-client-utils';
import * as clientUtils from '@aws-amplify/core/internals/aws-client-utils';

import { createDeleteObjectDeserializer } from '../../../../../../../src/foundation/factories/serviceClients/s3data/shared/serde';
import { StorageError } from '../../../../../../../src/errors/StorageError';

describe('createDeleteObjectDeserializer', () => {
	const deserializer = createDeleteObjectDeserializer();

	it('returns body for 2xx status code', async () => {
		const response: HttpResponse = {
			statusCode: 200,
			headers: {
				'x-amz-id-2': 'requestId2',
				'x-amz-request-id': 'requestId',
			},
			body: {
				json: () => Promise.resolve({}),
				blob: () => Promise.resolve(new Blob()),
				text: () => Promise.resolve(''),
			},
		};
		const output = await deserializer(response);

		expect(output).toEqual(
			expect.objectContaining({
				$metadata: {
					requestId: response.headers['x-amz-request-id'],
					extendedRequestId: response.headers['x-amz-id-2'],
					httpStatusCode: 200,
				},
			}),
		);
	});

	it('throws StorageError for 4xx status code', async () => {
		const expectedErrorName = 'TestError';
		const expectedErrorMessage = '400';
		const expectedError = new Error(expectedErrorMessage);
		expectedError.name = expectedErrorName;

		jest
			.spyOn(clientUtils, 'parseJsonError')
			.mockReturnValueOnce(expectedError as any);

		const response: HttpResponse = {
			statusCode: 400,
			body: {
				json: () => Promise.resolve({}),
				blob: () => Promise.resolve(new Blob()),
				text: () => Promise.resolve(''),
			},
			headers: {},
		};

		expect(deserializer(response as any)).rejects.toThrow(
			new StorageError({
				name: expectedErrorName,
				message: expectedErrorMessage,
			}),
		);
	});
});

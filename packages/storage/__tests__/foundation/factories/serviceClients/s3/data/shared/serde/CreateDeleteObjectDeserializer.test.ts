// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	HttpResponse,
	parseJsonError,
} from '@aws-amplify/core/internals/aws-client-utils';

import { createDeleteObjectDeserializer } from '../../../../../../../../src/foundation/factories/serviceClients/s3/data/shared/serde';
import { StorageError } from '../../../../../../../../src/errors/StorageError';

jest.mock('@aws-amplify/core/internals/aws-client-utils');

const mockParseJsonError = jest.mocked(parseJsonError);

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

		expect(output).toStrictEqual({
			$metadata: undefined,
		});
	});

	it('throws StorageError for 4xx status code', async () => {
		const expectedErrorName = 'TestError';
		const expectedErrorMessage = '400';
		const expectedError = new Error(expectedErrorMessage);
		expectedError.name = expectedErrorName;

		mockParseJsonError.mockReturnValueOnce(expectedError as any);
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

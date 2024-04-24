// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '@aws-amplify/core/internals/aws-client-utils';

import { s3TransferHandler } from '../../../../../../src/providers/s3/utils/client/runtime/s3TransferHandler/fetch';
import { StorageError } from '../../../../../../src/errors/StorageError';

import cases from './cases';

jest.mock(
	'../../../../../../src/providers/s3/utils/client/runtime/s3TransferHandler/fetch',
);

const mockS3TransferHandler = s3TransferHandler as jest.Mock;
const mockBinaryResponse = ({
	status,
	headers,
	body,
}: {
	status: number;
	headers: Record<string, string>;
	body: string;
}): HttpResponse => {
	const responseBody = {
		json: async (): Promise<any> => {
			throw new Error(
				'Parsing response to JSON is not implemented. Please use response.text() instead.',
			);
		},
		blob: async () => new Blob([body], { type: 'plain/text' }),
		text: async () => body,
	} as HttpResponse['body'];

	return {
		statusCode: status,
		headers,
		body: responseBody,
	} as any;
};

describe('S3 APIs functional test', () => {
	beforeEach(() => {
		mockS3TransferHandler.mockReset();
	});
	test.each(cases)(
		'%s %s',
		async (
			caseType,
			name,
			handler,
			config,
			input,
			expectedRequest,
			response,
			outputOrError,
		) => {
			expect.assertions(2);
			mockS3TransferHandler.mockResolvedValue(
				mockBinaryResponse(response as any),
			);
			try {
				const output = await handler(config, input as any);
				if (caseType === 'happy case') {
					expect(output).toEqual(outputOrError);
					expect(mockS3TransferHandler).toHaveBeenCalledWith(
						expectedRequest,
						expect.anything(),
					);
				} else {
					fail(`${name} ${caseType} should fail`);
				}
			} catch (e) {
				if (caseType === 'happy case') {
					fail(`${name} ${caseType} should succeed: ${e}`);
				} else {
					expect(e).toBeInstanceOf(StorageError);
					expect(e).toEqual(expect.objectContaining(outputOrError));
				}
			}
		},
	);
});

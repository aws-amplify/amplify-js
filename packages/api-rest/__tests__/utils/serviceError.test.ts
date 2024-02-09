// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { parseJsonError as parseAwsJsonError } from '@aws-amplify/core/internals/aws-client-utils';

import { parseRestApiServiceError } from '../../src/utils';
import { RestApiError } from '../../src/errors';

jest.mock('@aws-amplify/core/internals/aws-client-utils');

const mockParseJsonError = parseAwsJsonError as jest.Mock;
const mockResponse = {
	statusCode: 400,
	headers: {},
	body: {
		json: jest.fn(),
		blob: jest.fn(),
		text: jest.fn(),
	},
};

describe('parseRestApiServiceError', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});
	it('should return undefined if response is undefined', async () => {
		expect.assertions(1);
		expect(await parseRestApiServiceError(undefined)).toBeUndefined();
	});

	it('should return undefined if AWS JSON error parser returns undefined', async () => {
		expect.assertions(1);
		mockParseJsonError.mockReturnValue(undefined);
		expect(await parseRestApiServiceError(mockResponse)).toBeUndefined();
	});

	it('should return a RestApiError with the parsed AWS error', async () => {
		expect.assertions(2);
		const parsedAwsError = {
			name: 'UnknownError',
			message: 'Unknown error',
			$metadata: {},
		};
		mockParseJsonError.mockResolvedValue(parsedAwsError);
		const parsedRestApiError = await parseRestApiServiceError(mockResponse);
		expect(parsedRestApiError).toBeInstanceOf(RestApiError);
		expect(parsedRestApiError).toMatchObject(parsedAwsError);
	});
});

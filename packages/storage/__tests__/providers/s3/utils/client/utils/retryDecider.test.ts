// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	HttpResponse,
	getRetryDecider as getDefaultRetryDecider,
} from '@aws-amplify/core/internals/aws-client-utils';

import { retryDecider } from '../../../../../../src/providers/s3/utils/client/utils';
import { parseXmlError } from '../../../../../../src/providers/s3/utils/client/utils/parsePayload';

jest.mock(
	'../../../../../../../src/providers/s3/utils/client/utils/parsePayload',
);
jest.mock('@aws-amplify/core/internals/aws-client-utils');

const mockErrorParser = jest.mocked(parseXmlError);

describe('retryDecider', () => {
	const mockHttpResponse: HttpResponse = {
		statusCode: 200,
		headers: {},
		body: 'body' as any,
	};

	beforeEach(() => {
		jest.mocked(getDefaultRetryDecider).mockReturnValue(async () => {
			return { retryable: false };
		});
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should invoke the default retry decider', async () => {
		expect.assertions(3);
		const { retryable, isCredentialsExpiredError } = await retryDecider(
			mockHttpResponse,
			undefined,
			{},
		);
		expect(getDefaultRetryDecider).toHaveBeenCalledWith(mockErrorParser);
		expect(retryable).toBe(false);
		expect(isCredentialsExpiredError).toBeFalsy();
	});

	describe('handling expired token errors', () => {
		const mockErrorMessage = 'Token expired';
		it.each(['RequestExpired', 'ExpiredTokenException', 'ExpiredToken'])(
			'should retry if expired credentials error name %s',
			async errorName => {
				expect.assertions(2);
				const parsedError = {
					name: errorName,
					message: mockErrorMessage,
					$metadata: {},
				};
				mockErrorParser.mockResolvedValue(parsedError);
				const { retryable, isCredentialsExpiredError } = await retryDecider(
					{ ...mockHttpResponse, statusCode: 400 },
					undefined,
					{},
				);
				expect(retryable).toBe(true);
				expect(isCredentialsExpiredError).toBe(true);
			},
		);

		it('should retry if error message indicates invalid credentials', async () => {
			expect.assertions(2);
			const parsedError = {
				name: 'InvalidSignature',
				message: 'Auth token in request is expired.',
				$metadata: {},
			};
			mockErrorParser.mockResolvedValue(parsedError);
			const { retryable, isCredentialsExpiredError } = await retryDecider(
				{ ...mockHttpResponse, statusCode: 400 },
				undefined,
				{},
			);
			expect(retryable).toBe(true);
			expect(isCredentialsExpiredError).toBe(true);
		});

		it('should not retry if invalid credentials error has been retried previously', async () => {
			expect.assertions(2);
			const parsedError = {
				name: 'RequestExpired',
				message: mockErrorMessage,
				$metadata: {},
			};
			mockErrorParser.mockResolvedValue(parsedError);
			const { retryable, isCredentialsExpiredError } = await retryDecider(
				{ ...mockHttpResponse, statusCode: 400 },
				undefined,
				{ isCredentialsExpired: true },
			);
			expect(retryable).toBe(false);
			expect(isCredentialsExpiredError).toBe(true);
		});
	});
});

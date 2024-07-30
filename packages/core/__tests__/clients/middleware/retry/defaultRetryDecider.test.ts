// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '../../../../src/clients';
import { getRetryDecider } from '../../../../src/clients/middleware/retry';
import { isClockSkewError } from '../../../../src/clients/middleware/retry/isClockSkewError';

jest.mock('../../../../src/clients/middleware/retry/isClockSkewError');

const mockIsClockSkewError = jest.mocked(isClockSkewError);

describe('getRetryDecider', () => {
	const mockErrorParser = jest.fn();
	const mockHttpResponse: HttpResponse = {
		statusCode: 200,
		headers: {},
		body: 'body' as any,
	};

	beforeEach(() => {
		jest.resetAllMocks();
	});

	it('should handle network errors', async () => {
		expect.assertions(2);
		const retryDecider = getRetryDecider(mockErrorParser);
		const connectionError = Object.assign(new Error(), {
			name: 'Network error',
		});
		const { retryable, isCredentialsExpiredError } = await retryDecider(
			mockHttpResponse,
			connectionError,
		);
		expect(retryable).toBe(true);
		expect(isCredentialsExpiredError).toBeFalsy();
	});

	describe('handling throttling errors', () => {
		it.each([
			'BandwidthLimitExceeded',
			'EC2ThrottledException',
			'LimitExceededException',
			'PriorRequestNotComplete',
			'ProvisionedThroughputExceededException',
			'RequestLimitExceeded',
			'RequestThrottled',
			'RequestThrottledException',
			'SlowDown',
			'ThrottledException',
			'Throttling',
			'ThrottlingException',
			'TooManyRequestsException',
		])('should return retryable at %s error', async errorCode => {
			expect.assertions(2);
			mockErrorParser.mockResolvedValueOnce({
				code: errorCode,
			});
			const retryDecider = getRetryDecider(mockErrorParser);
			const { retryable, isCredentialsExpiredError } = await retryDecider(
				mockHttpResponse,
				undefined,
			);
			expect(retryable).toBe(true);
			expect(isCredentialsExpiredError).toBeFalsy();
		});

		it('should set retryable for 402 error', async () => {
			expect.assertions(2);
			const retryDecider = getRetryDecider(mockErrorParser);
			const {
				retryable,
				isCredentialsExpiredError: isInvalidCredentialsError,
			} = await retryDecider(
				{
					...mockHttpResponse,
					statusCode: 429,
				},
				undefined,
			);
			expect(retryable).toBe(true);
			expect(isInvalidCredentialsError).toBeFalsy();
		});
	});

	describe('handling clockskew error', () => {
		it.each([{ code: 'ClockSkew' }, { name: 'ClockSkew' }])(
			'should handle clockskew error %o',
			async parsedError => {
				expect.assertions(3);
				mockErrorParser.mockResolvedValue(parsedError);
				mockIsClockSkewError.mockReturnValue(true);
				const retryDecider = getRetryDecider(mockErrorParser);
				const { retryable, isCredentialsExpiredError } = await retryDecider(
					mockHttpResponse,
					undefined,
				);
				expect(retryable).toBe(true);
				expect(isCredentialsExpiredError).toBeFalsy();
				expect(mockIsClockSkewError).toHaveBeenCalledWith(
					Object.values(parsedError)[0],
				);
			},
		);
	});

	it.each([500, 502, 503, 504])(
		'should handle server-side status code %s',
		async statusCode => {
			const retryDecider = getRetryDecider(mockErrorParser);
			const { retryable, isCredentialsExpiredError } = await retryDecider(
				{
					...mockHttpResponse,
					statusCode,
				},
				undefined,
			);
			expect(retryable).toBe(true);
			expect(isCredentialsExpiredError).toBeFalsy();
		},
	);

	it.each(['TimeoutError', 'RequestTimeout', 'RequestTimeoutException'])(
		'should handle server-side timeout error code %s',
		async errorCode => {
			expect.assertions(2);
			mockErrorParser.mockResolvedValue({ code: errorCode });
			const retryDecider = getRetryDecider(mockErrorParser);
			const { retryable, isCredentialsExpiredError } = await retryDecider(
				mockHttpResponse,
				undefined,
			);
			expect(retryable).toBe(true);
			expect(isCredentialsExpiredError).toBeFalsy();
		},
	);
});

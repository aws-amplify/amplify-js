// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '../../../../src/clients';
import { getRetryDecider } from '../../../../src/clients/middleware/retry';
import { isClockSkewError } from '../../../../src/clients/middleware/retry/isClockSkewError';
import { AmplifyError } from '../../../../src/errors';
import { AmplifyErrorCode } from '../../../../src/types';

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

	describe('created retryDecider', () => {
		const mockNetworkErrorThrownFromFetch = new AmplifyError({
			name: AmplifyErrorCode.NetworkError,
			message: 'Network Error',
		});
		const mockNetworkErrorThrownFromXHRInStorage = new Error('Network Error');
		mockNetworkErrorThrownFromXHRInStorage.name = 'ERR_NETWORK';
		mockNetworkErrorThrownFromXHRInStorage.message = 'Network Error';

		test.each([
			[
				'a network error from the fetch handler',
				{
					retryable: true,
				},
				mockNetworkErrorThrownFromFetch,
			],
			[
				'a network error from the XHR handler defined in Storage',
				{
					retryable: true,
				},
				mockNetworkErrorThrownFromXHRInStorage,
			],
		])('when receives %p returns %p', async (_, expected, error) => {
			const mockResponse = {} as unknown as HttpResponse;
			mockErrorParser.mockReturnValueOnce(error);
			const retryDecider = getRetryDecider(mockErrorParser);
			const result = await retryDecider(mockResponse, error);

			expect(result).toEqual(expected);
		});
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

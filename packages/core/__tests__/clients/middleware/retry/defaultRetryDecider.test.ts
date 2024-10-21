// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { HttpResponse } from '../../../../src/clients';
import { getRetryDecider } from '../../../../src/clients/middleware/retry/defaultRetryDecider';
import { AmplifyError } from '../../../../src/errors';
import { AmplifyErrorCode } from '../../../../src/types';

describe('getRetryDecider', () => {
	const mockErrorParser = jest.fn();

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
				true,
				mockNetworkErrorThrownFromFetch,
			],
			[
				'a network error from the XHR handler defined in Storage',
				true,
				mockNetworkErrorThrownFromXHRInStorage,
			],
		])('when receives %p returns %p', (_, expected, error) => {
			const mockResponse = {} as unknown as HttpResponse;
			mockErrorParser.mockReturnValueOnce(error);
			const retryDecider = getRetryDecider(mockErrorParser);

			expect(retryDecider(mockResponse, error)).resolves.toBe(expected);
		});
	});
});

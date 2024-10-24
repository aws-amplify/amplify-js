// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { GetUrlInput, GetUrlWithPathInput } from '../../../../src';
import { getUrl } from '../../../../src/providers/s3/apis';
import { getUrl as internalGetUrlImpl } from '../../../../src/providers/s3/apis/internal/getUrl';

jest.mock('../../../../src/providers/s3/apis/internal/getUrl');

const mockInternalGetUrlImpl = jest.mocked(internalGetUrlImpl);

describe('client-side getUrl', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalGetUrlImpl.mockReturnValue(mockInternalResult);
		const input: GetUrlInput = {
			key: 'source-key',
		};
		expect(getUrl(input)).toEqual(mockInternalResult);
		expect(mockInternalGetUrlImpl).toBeCalledWith(Amplify, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalGetUrlImpl.mockReturnValue(mockInternalResult);
		const input: GetUrlWithPathInput = {
			path: 'abc',
		};
		expect(getUrl(input)).toEqual(mockInternalResult);
		expect(mockInternalGetUrlImpl).toBeCalledWith(Amplify, input);
	});
});

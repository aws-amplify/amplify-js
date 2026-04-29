// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';
import { GetUrlInput, GetUrlWithPathInput } from '../../../../../src';
import { getUrl } from '../../../../../src/providers/s3/apis/server';
import { getUrl as internalGeturlImpl } from '../../../../../src/providers/s3/apis/internal/getUrl';

jest.mock('../../../../../src/providers/s3/apis/internal/getUrl');

const mockInternalGeturlImpl = jest.mocked(internalGeturlImpl);
const mockInternalResult = 'RESULT' as any;
const mockCtx = createMockAmplifyContext();

describe('server-side getUrl', () => {
	beforeEach(() => {
		mockInternalGeturlImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const input: GetUrlInput = {
			key: 'source-key',
		};
		expect(getUrl(mockCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalGeturlImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const input: GetUrlWithPathInput = {
			path: 'abc',
		};
		expect(getUrl(mockCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalGeturlImpl).toBeCalledWith(mockCtx, input);
	});
});

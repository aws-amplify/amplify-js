// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '../../../testUtils/mockAmplifyContext';
import { downloadData } from '../../../../src/providers/s3/apis';
import { downloadData as internalDownloadDataImpl } from '../../../../src/providers/s3/apis/internal/downloadData';

jest.mock('../../../../src/providers/s3/apis/internal/downloadData');

const mockInternalDownloadDataImpl = jest.mocked(internalDownloadDataImpl);
const mockCtx = createMockAmplifyContext();

describe('client-side downloadData', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalDownloadDataImpl.mockReturnValue(mockInternalResult);
		const input = {
			key: 'key',
			data: 'data',
			options: {
				accessLevel: 'protected' as const,
			},
		};
		expect(downloadData(mockCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalDownloadDataImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalDownloadDataImpl.mockReturnValue(mockInternalResult);
		const input = {
			path: 'path',
			data: 'data',
		};
		expect(downloadData(mockCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalDownloadDataImpl).toBeCalledWith(mockCtx, input);
	});
});

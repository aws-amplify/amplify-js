// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultStorage } from '@aws-amplify/core';

import { uploadData } from '../../../../src/providers/s3/apis';
import { uploadData as internalUploadDataImpl } from '../../../../src/providers/s3/apis/internal/uploadData';

jest.mock('../../../../src/providers/s3/apis/internal/uploadData');

const mockInternalUploadDataImpl = jest.mocked(internalUploadDataImpl);

describe('client-side uploadData', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalUploadDataImpl.mockReturnValue(mockInternalResult);
		const input = {
			key: 'key',
			data: 'data',
			options: {
				accessLevel: 'protected' as const,
			},
		};
		expect(uploadData(input)).toEqual(mockInternalResult);
		expect(mockInternalUploadDataImpl).toBeCalledWith({
			...input,
			options: {
				...input.options,
				resumableUploadsCache: defaultStorage,
			},
		});
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalUploadDataImpl.mockReturnValue(mockInternalResult);
		const input = {
			path: 'path',
			data: 'data',
			options: {
				preventOverwrite: true,
			},
		};
		expect(uploadData(input)).toEqual(mockInternalResult);
		expect(mockInternalUploadDataImpl).toBeCalledWith({
			...input,
			options: {
				...input.options,
				resumableUploadsCache: defaultStorage,
			},
		});
	});
});

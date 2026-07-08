// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { defaultStorage } from '@aws-amplify/core';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import { uploadData } from '../../../../src/providers/s3/apis';
import { uploadData as internalUploadDataImpl } from '../../../../src/providers/s3/apis/internal/uploadData';
import { createMockAmplifyContext } from '../../../testUtils/mockAmplifyContext';

jest.mock('../../../../src/providers/s3/apis/internal/uploadData');

const mockInternalUploadDataImpl = jest.mocked(internalUploadDataImpl);
const mockCtx = createMockAmplifyContext();

const expectedCtx = {
	amplify: mockCtx,
	readFile: expect.any(Function),
	toBase64: expect.any(Function),
};

describe('client-side uploadData', () => {
	beforeAll(() => {
		// The public API falls back to the global AmplifyContext when no ctx is
		// passed explicitly; establish it so resolveCtxArgs can resolve it.
		setGlobalContext(mockCtx);
	});

	afterAll(() => {
		clearGlobalContext();
	});

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
		expect(mockInternalUploadDataImpl).toBeCalledWith(expectedCtx, {
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
		expect(mockInternalUploadDataImpl).toBeCalledWith(expectedCtx, {
			...input,
			options: {
				...input.options,
				resumableUploadsCache: defaultStorage,
			},
		});
	});
});

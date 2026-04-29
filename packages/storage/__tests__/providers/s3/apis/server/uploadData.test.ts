// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import { UploadDataInput, UploadDataWithPathInput } from '../../../../../src';
import { uploadData } from '../../../../../src/providers/s3/apis/server';
import { uploadData as internalUploadDataImpl } from '../../../../../src/providers/s3/apis/internal/uploadData';

jest.mock('../../../../../src/providers/s3/apis/internal/uploadData');
jest.mock('@aws-amplify/core/internals/adapter-core');

const mockInternalUploadDataImpl = jest.mocked(internalUploadDataImpl);
const mockGetAmplifyServerContext = jest.mocked(getAmplifyServerContext);
const mockInternalResult = 'UPLOAD_TASK' as any;
const mockAmplifyClass = 'AMPLIFY_CLASS' as any;
const mockAmplifyContextSpec = {
	token: { value: Symbol('123') },
};

describe('server-side uploadData', () => {
	beforeEach(() => {
		mockGetAmplifyServerContext.mockReturnValue({
			amplify: mockAmplifyClass,
		} as any);
		mockInternalUploadDataImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with path and return output from internal implementation', () => {
		const input: UploadDataWithPathInput = {
			path: 'path/to/object',
			data: 'data',
			options: {
				contentType: 'text/plain',
			},
		};
		expect(uploadData(mockAmplifyContextSpec as any, input)).toEqual(
			mockInternalResult,
		);
		expect(mockInternalUploadDataImpl).toBeCalledWith(mockAmplifyClass, input);
	});

	it('should pass through input with key and return output from internal implementation', () => {
		const input: UploadDataInput = {
			key: 'some-key',
			data: 'data',
			options: {
				accessLevel: 'protected' as const,
			},
		};
		expect(uploadData(mockAmplifyContextSpec as any, input)).toEqual(
			mockInternalResult,
		);
		expect(mockInternalUploadDataImpl).toBeCalledWith(mockAmplifyClass, input);
	});

	it('should NOT inject resumableUploadsCache (server-side does not support pause/resume)', () => {
		const input: UploadDataWithPathInput = {
			path: 'path/to/object',
			data: 'data',
		};
		uploadData(mockAmplifyContextSpec as any, input);
		const passedInput = mockInternalUploadDataImpl.mock.calls[0][1] as any;
		expect(passedInput.options?.resumableUploadsCache).toBeUndefined();
	});

	it('should use server context amplify instance, not global Amplify', () => {
		const input: UploadDataWithPathInput = {
			path: 'path/to/object',
			data: 'data',
		};
		uploadData(mockAmplifyContextSpec as any, input);
		expect(mockGetAmplifyServerContext).toBeCalledWith(mockAmplifyContextSpec);
		// Ensure the amplify passed to internal uploadData is from the server context
		expect(mockInternalUploadDataImpl.mock.calls[0][0]).toBe(mockAmplifyClass);
	});
});

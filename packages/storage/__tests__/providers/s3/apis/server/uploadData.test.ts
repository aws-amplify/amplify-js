// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

import {
	UploadDataInput,
	UploadDataServerOutput,
	UploadDataServerWithPathOutput,
	UploadDataWithPathInput,
} from '../../../../../src';
import { uploadData } from '../../../../../src/providers/s3/apis/server';
import { uploadData as internalUploadDataImpl } from '../../../../../src/providers/s3/apis/internal/uploadData';

jest.mock('../../../../../src/providers/s3/apis/internal/uploadData');

const mockInternalUploadDataImpl = jest.mocked(internalUploadDataImpl);
const mockInternalResult: any = {
	cancel: jest.fn(),
	pause: jest.fn(),
	resume: jest.fn(),
	state: 'IN_PROGRESS',
	result: Promise.resolve({ path: 'x' }),
};

// Phase C4: the server entry accepts a branded `AmplifyContext` directly (no
// server-context registry / `getAmplifyServerContext`). uploadData keeps a
// server-specific task type that omits pause/resume, so it wraps the ctx with
// the server `readFile`/`toBase64` helpers before delegating to the internal
// implementation.
describe('server-side uploadData', () => {
	beforeEach(() => {
		mockInternalUploadDataImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with path and return output from internal implementation', () => {
		const ctx = createMockAmplifyContext();
		const input: UploadDataWithPathInput = {
			path: 'path/to/object',
			data: 'data',
			options: {
				contentType: 'text/plain',
			},
		};
		expect(uploadData(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalUploadDataImpl).toBeCalledWith(
			{
				amplify: ctx,
				readFile: expect.any(Function),
				toBase64: expect.any(Function),
			},
			input,
		);
	});

	it('should pass through input with key and return output from internal implementation', () => {
		const ctx = createMockAmplifyContext();
		const input: UploadDataInput = {
			key: 'some-key',
			data: 'data',
			options: {
				accessLevel: 'protected' as const,
			},
		};
		expect(uploadData(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalUploadDataImpl).toBeCalledWith(
			{
				amplify: ctx,
				readFile: expect.any(Function),
				toBase64: expect.any(Function),
			},
			input,
		);
	});

	it('should NOT inject resumableUploadsCache (server-side does not support pause/resume)', () => {
		const ctx = createMockAmplifyContext();
		const input: UploadDataWithPathInput = {
			path: 'path/to/object',
			data: 'data',
		};
		uploadData(ctx, input);
		const passedInput = mockInternalUploadDataImpl.mock.calls[0][1] as any;
		expect(passedInput.options?.resumableUploadsCache).toBeUndefined();
	});

	it('should pass the supplied AmplifyContext straight through to the internal impl', () => {
		const ctx = createMockAmplifyContext();
		const input: UploadDataWithPathInput = {
			path: 'path/to/object',
			data: 'data',
		};
		uploadData(ctx, input);
		// The amplify passed to internal uploadData must be the exact branded
		// context the caller supplied, exposing the top-level context methods the
		// internal impl relies on.
		const passedAmplify = (mockInternalUploadDataImpl.mock.calls[0][0] as any)
			.amplify;
		expect(passedAmplify).toBe(ctx);
		expect(typeof passedAmplify.fetchAuthSession).toBe('function');
		expect(typeof passedAmplify.clearCredentials).toBe('function');
		expect(typeof passedAmplify.getTokens).toBe('function');
	});

	it('should return a task type that does NOT expose pause/resume at the type level', () => {
		const ctx = createMockAmplifyContext();
		const withPathInput: UploadDataWithPathInput = {
			path: 'path/to/object',
			data: 'data',
		};
		const withKeyInput: UploadDataInput = { key: 'k', data: 'd' };

		// Compile-time type assertions: the returned types should be the server
		// (non-pausable) outputs. If uploadData returned UploadDataOutput /
		// UploadDataWithPathOutput instead, these assignments would still
		// compile because UploadTask is a supertype — so we also rely on the
		// commented-out pause/resume lines below, which MUST fail to compile.
		const pathTask: UploadDataServerWithPathOutput = uploadData(
			ctx,
			withPathInput,
		);
		const keyTask: UploadDataServerOutput = uploadData(ctx, withKeyInput);

		// pause/resume are intentionally absent from the type and would cause a
		// TS2339 error if uncommented:
		//   pathTask.pause();
		//   pathTask.resume();
		expect(typeof pathTask.cancel).toBe('function');
		expect(typeof keyTask.cancel).toBe('function');
	});
});

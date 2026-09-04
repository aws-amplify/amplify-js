// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

import {
	ListAllInput,
	ListAllWithPathInput,
	ListPaginateInput,
	ListPaginateWithPathInput,
} from '../../../../../src';
import { list } from '../../../../../src/providers/s3/apis/server';
import { list as internalListImpl } from '../../../../../src/providers/s3/apis/internal/list';

jest.mock('../../../../../src/providers/s3/apis/internal/list');

const mockInternalListImpl = jest.mocked(internalListImpl);
const mockInternalResult = 'RESULT' as any;

// Phase C4: the server entry is a bare re-export of the ctx-native main API.
// The caller supplies a branded `AmplifyContext` directly (no server-context
// registry / `getAmplifyServerContext`), which flows straight to the internal
// implementation.
describe('server-side list', () => {
	beforeEach(() => {
		mockInternalListImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through list all input with key and output to internal implementation', async () => {
		const ctx = createMockAmplifyContext();
		const input: ListAllInput = {
			prefix: 'source-key',
		};
		expect(list(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(ctx, input);
	});

	it('should pass through list paginate input with key and output to internal implementation', async () => {
		const ctx = createMockAmplifyContext();
		const input: ListPaginateInput = {
			prefix: 'source-key',
			options: {
				nextToken: '123',
				pageSize: 10,
			},
		};
		expect(list(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(ctx, input);
	});

	it('should pass through list all input with path and output to internal implementation', async () => {
		const ctx = createMockAmplifyContext();
		const input: ListAllWithPathInput = {
			path: 'abc',
		};
		expect(list(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(ctx, input);
	});

	it('should pass through list paginate input with path and output to internal implementation', async () => {
		const ctx = createMockAmplifyContext();
		const input: ListPaginateWithPathInput = {
			path: 'abc',
			options: {
				nextToken: '123',
				pageSize: 10,
			},
		};
		expect(list(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(ctx, input);
	});
});

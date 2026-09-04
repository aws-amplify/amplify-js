// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import {
	ListAllInput,
	ListAllWithPathInput,
	ListPaginateInput,
	ListPaginateWithPathInput,
} from '../../../../src';
import { list } from '../../../../src/providers/s3/apis';
import { list as internalListImpl } from '../../../../src/providers/s3/apis/internal/list';

jest.mock('../../../../src/providers/s3/apis/internal/list');

const mockInternalListImpl = jest.mocked(internalListImpl);
const mockCtx = createMockAmplifyContext();

describe('client-side list', () => {
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

	it('should pass through list all input with key and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalListImpl.mockReturnValue(mockInternalResult);
		const input: ListAllInput = {
			prefix: 'source-key',
		};
		expect(list(input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through list paginate input with key and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalListImpl.mockReturnValue(mockInternalResult);
		const input: ListPaginateInput = {
			prefix: 'source-key',
			options: {
				nextToken: '123',
				pageSize: 10,
			},
		};
		expect(list(input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through list all input with path and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalListImpl.mockReturnValue(mockInternalResult);
		const input: ListAllWithPathInput = {
			path: 'abc',
		};
		expect(list(input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through list paginate input with path and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalListImpl.mockReturnValue(mockInternalResult);
		const input: ListPaginateWithPathInput = {
			path: 'abc',
			options: {
				nextToken: '123',
				pageSize: 10,
			},
		};
		expect(list(input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass explicit AmplifyContext to internal implementation when called with two args', () => {
		const explicitCtx = createMockAmplifyContext();
		const mockInternalResult = 'RESULT' as any;
		mockInternalListImpl.mockReturnValue(mockInternalResult);
		const input: ListAllWithPathInput = {
			path: 'abc',
		};
		expect(list(explicitCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(explicitCtx, input);
	});
});

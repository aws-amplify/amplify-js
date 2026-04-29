// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';
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
const mockCtx = createMockAmplifyContext();

describe('server-side list', () => {
	beforeEach(() => {
		mockInternalListImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through list all input with key and output to internal implementation', async () => {
		const input: ListAllInput = {
			prefix: 'source-key',
		};
		expect(list(mockCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through list paginate input with key and output to internal implementation', async () => {
		const input: ListPaginateInput = {
			prefix: 'source-key',
			options: {
				nextToken: '123',
				pageSize: 10,
			},
		};
		expect(list(mockCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through list all input with path and output to internal implementation', async () => {
		const input: ListAllWithPathInput = {
			path: 'abc',
		};
		expect(list(mockCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through list paginate input with path and output to internal implementation', async () => {
		const input: ListPaginateWithPathInput = {
			path: 'abc',
			options: {
				nextToken: '123',
				pageSize: 10,
			},
		};
		expect(list(mockCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(mockCtx, input);
	});
});

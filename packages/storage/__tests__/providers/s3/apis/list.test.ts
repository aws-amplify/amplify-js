// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

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

describe('client-side list', () => {
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
		expect(mockInternalListImpl).toBeCalledWith(Amplify, input);
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
		expect(mockInternalListImpl).toBeCalledWith(Amplify, input);
	});

	it('should pass through list all input with path and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalListImpl.mockReturnValue(mockInternalResult);
		const input: ListAllWithPathInput = {
			path: 'abc',
		};
		expect(list(input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(Amplify, input);
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
		expect(mockInternalListImpl).toBeCalledWith(Amplify, input);
	});
});

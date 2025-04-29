// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import {
	ListAllInput,
	ListAllWithPathInput,
	ListPaginateInput,
	ListPaginateWithPathInput,
} from '../../../../../src';
import { list } from '../../../../../src/providers/s3/apis/server';
import { list as internalListImpl } from '../../../../../src/providers/s3/apis/internal/list';

jest.mock('../../../../../src/providers/s3/apis/internal/list');
jest.mock('@aws-amplify/core/internals/adapter-core');

const mockInternalListImpl = jest.mocked(internalListImpl);
const mockGetAmplifyServerContext = jest.mocked(getAmplifyServerContext);
const mockInternalResult = 'RESULT' as any;
const mockAmplifyClass = 'AMPLIFY_CLASS' as any;
const mockAmplifyContextSpec = {
	token: { value: Symbol('123') },
};

describe('server-side list', () => {
	beforeEach(() => {
		mockGetAmplifyServerContext.mockReturnValue({
			amplify: mockAmplifyClass,
		});
		mockInternalListImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through list all input with key and output to internal implementation', async () => {
		const input: ListAllInput = {
			prefix: 'source-key',
		};
		expect(list(mockAmplifyContextSpec, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(mockAmplifyClass, input);
	});

	it('should pass through list paginate input with key and output to internal implementation', async () => {
		const input: ListPaginateInput = {
			prefix: 'source-key',
			options: {
				nextToken: '123',
				pageSize: 10,
			},
		};
		expect(list(mockAmplifyContextSpec, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(mockAmplifyClass, input);
	});

	it('should pass through list all input with path and output to internal implementation', async () => {
		const input: ListAllWithPathInput = {
			path: 'abc',
		};
		expect(list(mockAmplifyContextSpec, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(mockAmplifyClass, input);
	});

	it('should pass through list paginate input with path and output to internal implementation', async () => {
		const input: ListPaginateWithPathInput = {
			path: 'abc',
			options: {
				nextToken: '123',
				pageSize: 10,
			},
		};
		expect(list(mockAmplifyContextSpec, input)).toEqual(mockInternalResult);
		expect(mockInternalListImpl).toBeCalledWith(mockAmplifyClass, input);
	});
});

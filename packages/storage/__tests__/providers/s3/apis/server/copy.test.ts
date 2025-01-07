// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import { CopyInput, CopyWithPathInput } from '../../../../../src';
import { copy } from '../../../../../src/providers/s3/apis/server';
import { copy as internalCopyImpl } from '../../../../../src/providers/s3/apis/internal/copy';

jest.mock('../../../../../src/providers/s3/apis/internal/copy');
jest.mock('@aws-amplify/core/internals/adapter-core');

const mockInternalCopyImpl = jest.mocked(internalCopyImpl);
const mockGetAmplifyServerContext = jest.mocked(getAmplifyServerContext);
const mockInternalResult = 'RESULT' as any;
const mockAmplifyClass = 'AMPLIFY_CLASS' as any;
const mockAmplifyContextSpec = {
	token: { value: Symbol('123') },
};

describe('server-side copy', () => {
	beforeEach(() => {
		mockGetAmplifyServerContext.mockReturnValue({
			amplify: mockAmplifyClass,
		});
		mockInternalCopyImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const input: CopyInput = {
			source: {
				key: 'source-key',
			},
			destination: {
				key: 'destination-key',
			},
		};
		expect(copy(mockAmplifyContextSpec, input)).toEqual(mockInternalResult);
		expect(mockInternalCopyImpl).toBeCalledWith(mockAmplifyClass, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const input: CopyWithPathInput = {
			source: { path: 'abc' },
			destination: { path: 'abc' },
		};
		expect(copy(mockAmplifyContextSpec, input)).toEqual(mockInternalResult);
		expect(mockInternalCopyImpl).toBeCalledWith(mockAmplifyClass, input);
	});
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { RemoveInput, RemoveWithPathInput } from '../../../../src';
import { remove } from '../../../../src/providers/s3/apis';
import { remove as internalRemoveImpl } from '../../../../src/providers/s3/apis/internal/remove';

jest.mock('../../../../src/providers/s3/apis/internal/remove');

const mockInternalRemoveImpl = jest.mocked(internalRemoveImpl);

describe('client-side remove', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalRemoveImpl.mockReturnValue(mockInternalResult);
		const input: RemoveInput = {
			key: 'source-key',
		};
		expect(remove(input)).toEqual(mockInternalResult);
		expect(mockInternalRemoveImpl).toBeCalledWith(Amplify, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalRemoveImpl.mockReturnValue(mockInternalResult);
		const input: RemoveWithPathInput = {
			path: 'abc',
		};
		expect(remove(input)).toEqual(mockInternalResult);
		expect(mockInternalRemoveImpl).toBeCalledWith(Amplify, input);
	});
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import { CopyInput, CopyWithPathInput } from '../../../../src';
import { copy } from '../../../../src/providers/s3/apis';
import { copy as internalCopyImpl } from '../../../../src/providers/s3/apis/internal/copy';

jest.mock('../../../../src/providers/s3/apis/internal/copy');

const mockInternalCopyImpl = jest.mocked(internalCopyImpl);

describe('client-side copy', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalCopyImpl.mockReturnValue(mockInternalResult);
		const input: CopyInput = {
			source: {
				key: 'source-key',
			},
			destination: {
				key: 'destination-key',
			},
		};
		expect(copy(input)).toEqual(mockInternalResult);
		expect(mockInternalCopyImpl).toBeCalledWith(Amplify, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalCopyImpl.mockReturnValue(mockInternalResult);
		const input: CopyWithPathInput = {
			source: { path: 'abc' },
			destination: { path: 'abc' },
		};
		expect(copy(input)).toEqual(mockInternalResult);
		expect(mockInternalCopyImpl).toBeCalledWith(Amplify, input);
	});
});

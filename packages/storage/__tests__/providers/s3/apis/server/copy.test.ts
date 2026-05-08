// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';
import { CopyInput, CopyWithPathInput } from '../../../../../src';
import { copy } from '../../../../../src/providers/s3/apis/server';
import { copy as internalCopyImpl } from '../../../../../src/providers/s3/apis/internal/copy';

jest.mock('../../../../../src/providers/s3/apis/internal/copy');

const mockInternalCopyImpl = jest.mocked(internalCopyImpl);
const mockInternalResult = 'RESULT' as any;
const mockCtx = createMockAmplifyContext();

describe('server-side copy', () => {
	beforeEach(() => {
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
		expect(copy(mockCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalCopyImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const input: CopyWithPathInput = {
			source: { path: 'abc' },
			destination: { path: 'abc' },
		};
		expect(copy(mockCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalCopyImpl).toBeCalledWith(mockCtx, input);
	});
});

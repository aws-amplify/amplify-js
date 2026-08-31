// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { CopyInput, CopyWithPathInput } from '../../../../../src';
import { copy } from '../../../../../src/providers/s3/apis/server';
import { copy as internalCopyImpl } from '../../../../../src/providers/s3/apis/internal/copy';
import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';

jest.mock('../../../../../src/providers/s3/apis/internal/copy');

const mockInternalCopyImpl = jest.mocked(internalCopyImpl);
const mockInternalResult = 'RESULT' as any;

// Phase C4: the server entry is a bare re-export of the ctx-native main API.
// The caller supplies a branded `AmplifyContext` directly (no server-context
// registry / `getAmplifyServerContext`), which flows straight to the internal
// implementation.
describe('server-side copy', () => {
	beforeEach(() => {
		mockInternalCopyImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const ctx = createMockAmplifyContext();
		const input: CopyInput = {
			source: {
				key: 'source-key',
			},
			destination: {
				key: 'destination-key',
			},
		};
		expect(copy(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalCopyImpl).toBeCalledWith(ctx, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const ctx = createMockAmplifyContext();
		const input: CopyWithPathInput = {
			source: { path: 'abc' },
			destination: { path: 'abc' },
		};
		expect(copy(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalCopyImpl).toBeCalledWith(ctx, input);
	});
});

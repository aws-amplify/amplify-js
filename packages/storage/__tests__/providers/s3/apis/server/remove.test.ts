// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RemoveInput, RemoveWithPathInput } from '../../../../../src';
import { remove } from '../../../../../src/providers/s3/apis/server';
import { remove as internalRemoveImpl } from '../../../../../src/providers/s3/apis/internal/remove';
import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';

jest.mock('../../../../../src/providers/s3/apis/internal/remove');

const mockInternalRemoveImpl = jest.mocked(internalRemoveImpl);
const mockInternalResult = 'RESULT' as any;

// Phase C4: the server entry is a bare re-export of the ctx-native main API.
// The caller supplies a branded `AmplifyContext` directly (no server-context
// registry / `getAmplifyServerContext`), which flows straight to the internal
// implementation.
describe('server-side remove', () => {
	beforeEach(() => {
		mockInternalRemoveImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const ctx = createMockAmplifyContext();
		const input: RemoveInput = {
			key: 'source-key',
		};
		expect(remove(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalRemoveImpl).toBeCalledWith(ctx, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const ctx = createMockAmplifyContext();
		const input: RemoveWithPathInput = {
			path: 'abc',
		};
		expect(remove(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalRemoveImpl).toBeCalledWith(ctx, input);
	});
});

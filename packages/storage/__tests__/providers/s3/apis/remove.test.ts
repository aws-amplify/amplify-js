// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import { RemoveInput, RemoveWithPathInput } from '../../../../src';
import { remove } from '../../../../src/providers/s3/apis';
import { remove as internalRemoveImpl } from '../../../../src/providers/s3/apis/internal/remove';
import { createMockAmplifyContext } from '../../../testUtils/mockAmplifyContext';

jest.mock('../../../../src/providers/s3/apis/internal/remove');

const mockInternalRemoveImpl = jest.mocked(internalRemoveImpl);
const mockCtx = createMockAmplifyContext();

describe('client-side remove', () => {
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

	it('should pass through input with key and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalRemoveImpl.mockReturnValue(mockInternalResult);
		const input: RemoveInput = {
			key: 'source-key',
		};
		expect(remove(input)).toEqual(mockInternalResult);
		expect(mockInternalRemoveImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalRemoveImpl.mockReturnValue(mockInternalResult);
		const input: RemoveWithPathInput = {
			path: 'abc',
		};
		expect(remove(input)).toEqual(mockInternalResult);
		expect(mockInternalRemoveImpl).toBeCalledWith(mockCtx, input);
	});
});

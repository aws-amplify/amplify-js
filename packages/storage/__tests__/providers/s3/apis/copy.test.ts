// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import { createMockAmplifyContext } from '../../../testUtils/mockAmplifyContext';
import { CopyInput, CopyWithPathInput } from '../../../../src';
import { copy } from '../../../../src/providers/s3/apis';
import { copy as internalCopyImpl } from '../../../../src/providers/s3/apis/internal/copy';

jest.mock('../../../../src/providers/s3/apis/internal/copy');

const mockInternalCopyImpl = jest.mocked(internalCopyImpl);

const mockCtx = createMockAmplifyContext();

describe('client-side copy', () => {
	beforeAll(() => {
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
		expect(mockInternalCopyImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalCopyImpl.mockReturnValue(mockInternalResult);
		const input: CopyWithPathInput = {
			source: { path: 'abc' },
			destination: { path: 'abc' },
		};
		expect(copy(input)).toEqual(mockInternalResult);
		expect(mockInternalCopyImpl).toBeCalledWith(mockCtx, input);
	});
});

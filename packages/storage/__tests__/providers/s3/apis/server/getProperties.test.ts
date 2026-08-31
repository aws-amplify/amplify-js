// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	GetPropertiesInput,
	GetPropertiesWithPathInput,
} from '../../../../../src';
import { getProperties } from '../../../../../src/providers/s3/apis/server';
import { getProperties as internalGetPropertiesImpl } from '../../../../../src/providers/s3/apis/internal/getProperties';
import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';

jest.mock('../../../../../src/providers/s3/apis/internal/getProperties');

const mockInternalGetPropertiesImpl = jest.mocked(internalGetPropertiesImpl);
const mockInternalResult = 'RESULT' as any;

// Phase C4: the server entry is a bare re-export of the ctx-native main API.
// The caller supplies a branded `AmplifyContext` directly (no server-context
// registry / `getAmplifyServerContext`), which flows straight to the internal
// implementation.
describe('server-side getProperties', () => {
	beforeEach(() => {
		mockInternalGetPropertiesImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const ctx = createMockAmplifyContext();
		const input: GetPropertiesInput = {
			key: 'source-key',
		};
		expect(getProperties(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalGetPropertiesImpl).toBeCalledWith(ctx, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const ctx = createMockAmplifyContext();
		const input: GetPropertiesWithPathInput = {
			path: 'abc',
		};
		expect(getProperties(ctx, input)).toEqual(mockInternalResult);
		expect(mockInternalGetPropertiesImpl).toBeCalledWith(ctx, input);
	});
});

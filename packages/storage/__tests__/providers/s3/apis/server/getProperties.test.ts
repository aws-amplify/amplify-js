// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '../../../../testUtils/mockAmplifyContext';
import {
	GetPropertiesInput,
	GetPropertiesWithPathInput,
} from '../../../../../src';
import { getProperties } from '../../../../../src/providers/s3/apis/server';
import { getProperties as internalGetpropertiesImpl } from '../../../../../src/providers/s3/apis/internal/getProperties';

jest.mock('../../../../../src/providers/s3/apis/internal/getProperties');

const mockInternalGetpropertiesImpl = jest.mocked(internalGetpropertiesImpl);
const mockInternalResult = 'RESULT' as any;
const mockCtx = createMockAmplifyContext();

describe('server-side getProperties', () => {
	beforeEach(() => {
		mockInternalGetpropertiesImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const input: GetPropertiesInput = {
			key: 'source-key',
		};
		expect(getProperties(mockCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalGetpropertiesImpl).toBeCalledWith(mockCtx, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const input: GetPropertiesWithPathInput = {
			path: 'abc',
		};
		expect(getProperties(mockCtx, input)).toEqual(mockInternalResult);
		expect(mockInternalGetpropertiesImpl).toBeCalledWith(mockCtx, input);
	});
});

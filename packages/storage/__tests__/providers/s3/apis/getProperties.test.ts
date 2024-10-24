// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from '@aws-amplify/core';

import {
	GetPropertiesInput,
	GetPropertiesWithPathInput,
} from '../../../../src';
import { getProperties } from '../../../../src/providers/s3/apis';
import { getProperties as internalGetPropertiesImpl } from '../../../../src/providers/s3/apis/internal/getProperties';

jest.mock('../../../../src/providers/s3/apis/internal/getProperties');

const mockInternalGetPropertiesImpl = jest.mocked(internalGetPropertiesImpl);

describe('client-side getProperties', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalGetPropertiesImpl.mockReturnValue(mockInternalResult);
		const input: GetPropertiesInput = {
			key: 'source-key',
		};
		expect(getProperties(input)).toEqual(mockInternalResult);
		expect(mockInternalGetPropertiesImpl).toBeCalledWith(Amplify, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const mockInternalResult = 'RESULT' as any;
		mockInternalGetPropertiesImpl.mockReturnValue(mockInternalResult);
		const input: GetPropertiesWithPathInput = {
			path: 'abc',
		};
		expect(getProperties(input)).toEqual(mockInternalResult);
		expect(mockInternalGetPropertiesImpl).toBeCalledWith(Amplify, input);
	});
});

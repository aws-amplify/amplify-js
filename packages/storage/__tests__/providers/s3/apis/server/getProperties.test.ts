// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import {
	GetPropertiesInput,
	GetPropertiesWithPathInput,
} from '../../../../../src';
import { getProperties } from '../../../../../src/providers/s3/apis/server';
import { getProperties as internalGetPropertiesImpl } from '../../../../../src/providers/s3/apis/internal/getProperties';

jest.mock('../../../../../src/providers/s3/apis/internal/getProperties');
jest.mock('@aws-amplify/core/internals/adapter-core');

const mockInternalGetPropertiesImpl = jest.mocked(internalGetPropertiesImpl);
const mockGetAmplifyServerContext = jest.mocked(getAmplifyServerContext);
const mockInternalResult = 'RESULT' as any;
const mockAmplifyClass = 'AMPLIFY_CLASS' as any;
const mockAmplifyContextSpec = {
	token: { value: Symbol('123') },
};

describe('server-side getProperties', () => {
	beforeEach(() => {
		mockGetAmplifyServerContext.mockReturnValue({
			amplify: mockAmplifyClass,
		});
		mockInternalGetPropertiesImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const input: GetPropertiesInput = {
			key: 'source-key',
		};
		expect(getProperties(mockAmplifyContextSpec, input)).toEqual(
			mockInternalResult,
		);
		expect(mockInternalGetPropertiesImpl).toBeCalledWith(
			mockAmplifyClass,
			input,
		);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const input: GetPropertiesWithPathInput = {
			path: 'abc',
		};
		expect(getProperties(mockAmplifyContextSpec, input)).toEqual(
			mockInternalResult,
		);
		expect(mockInternalGetPropertiesImpl).toBeCalledWith(
			mockAmplifyClass,
			input,
		);
	});
});

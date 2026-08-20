// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getAmplifyServerContext } from '@aws-amplify/core/internals/adapter-core';

import { RemoveInput, RemoveWithPathInput } from '../../../../../src';
import { remove } from '../../../../../src/providers/s3/apis/server';
import { remove as internalRemoveImpl } from '../../../../../src/providers/s3/apis/internal/remove';

jest.mock('../../../../../src/providers/s3/apis/internal/remove');
jest.mock('@aws-amplify/core/internals/adapter-core');

const mockInternalRemoveImpl = jest.mocked(internalRemoveImpl);
const mockGetAmplifyServerContext = jest.mocked(getAmplifyServerContext);
const mockInternalResult = 'RESULT' as any;
const mockResourcesConfig = {} as any;
// Realistic `AmplifyClass` shape: getConfig()/libraryOptions/Auth.*, without the
// top-level context methods (fetchAuthSession/clearCredentials/getTokens).
const mockAmplifyClass = {
	getConfig: jest.fn(() => mockResourcesConfig),
	libraryOptions: {},
	Auth: {
		fetchAuthSession: jest.fn(),
		clearCredentials: jest.fn(),
		getTokens: jest.fn(),
	},
} as any;
// The context the internal impl should receive after resolveServerContext
// adapts the AmplifyClass into an AmplifyContext.
const expectedResolvedCtx = {
	resourcesConfig: mockResourcesConfig,
	libraryOptions: mockAmplifyClass.libraryOptions,
	fetchAuthSession: expect.any(Function),
	clearCredentials: expect.any(Function),
	getTokens: expect.any(Function),
};
const mockAmplifyContextSpec = {
	token: { value: Symbol('123') },
};

describe('server-side remove', () => {
	beforeEach(() => {
		mockGetAmplifyServerContext.mockReturnValue({
			amplify: mockAmplifyClass,
		});
		mockInternalRemoveImpl.mockReturnValue(mockInternalResult);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should pass through input with key and output to internal implementation', async () => {
		const input: RemoveInput = {
			key: 'source-key',
		};
		expect(remove(mockAmplifyContextSpec, input)).toEqual(mockInternalResult);
		expect(mockInternalRemoveImpl).toBeCalledWith(expectedResolvedCtx, input);
	});

	it('should pass through input with path and output to internal implementation', async () => {
		const input: RemoveWithPathInput = {
			path: 'abc',
		};
		expect(remove(mockAmplifyContextSpec, input)).toEqual(mockInternalResult);
		expect(mockInternalRemoveImpl).toBeCalledWith(expectedResolvedCtx, input);
	});
});

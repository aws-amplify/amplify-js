// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	createAmplifyServerContext,
	destroyAmplifyServerContext,
} from '@aws-amplify/core/internals/adapter-core';

import { runWithAmplifyServerContext } from '../../src/adapter-core';

// mock serverContext
jest.mock('@aws-amplify/core/internals/adapter-core');
const mockCreateAmplifyServerContext = createAmplifyServerContext as jest.Mock;
const mockDestroyAmplifyServerContext =
	destroyAmplifyServerContext as jest.Mock;
const mockAmplifyConfig = {};
const mockTokenProvider = {
	getTokens: jest.fn(),
};
const mockCredentialAndIdentityProvider = {
	getCredentialsAndIdentityId: jest.fn(),
	clearCredentialsAndIdentityId: jest.fn(),
};
const mockContextSpec = {
	token: { value: Symbol('AmplifyServerContextToken') },
};

describe('runWithAmplifyServerContext', () => {
	beforeEach(() => {
		mockCreateAmplifyServerContext.mockReturnValueOnce(mockContextSpec);
	});

	afterEach(() => {
		mockDestroyAmplifyServerContext.mockReset();
	});

	it('should run the operation with the context', () => {
		const mockOperation = jest.fn();
		runWithAmplifyServerContext(
			mockAmplifyConfig,
			{
				Auth: {
					tokenProvider: mockTokenProvider,
					credentialsProvider: mockCredentialAndIdentityProvider,
				},
			},
			mockOperation,
		);

		expect(mockOperation).toHaveBeenCalledWith(mockContextSpec);
	});

	it('should destroy the context after the operation completed', async () => {
		const mockOperation = jest.fn();
		await runWithAmplifyServerContext(
			mockAmplifyConfig,
			{
				Auth: {
					tokenProvider: mockTokenProvider,
					credentialsProvider: mockCredentialAndIdentityProvider,
				},
			},
			mockOperation,
		);

		expect(mockDestroyAmplifyServerContext).toHaveBeenCalledWith(
			mockContextSpec,
		);
	});

	it('should destroy the context when the operation throws', async () => {
		const testError = new Error('some error');
		const mockOperation = jest.fn();
		mockOperation.mockRejectedValueOnce(testError);

		await expect(
			runWithAmplifyServerContext(
				mockAmplifyConfig,
				{
					Auth: {
						tokenProvider: mockTokenProvider,
						credentialsProvider: mockCredentialAndIdentityProvider,
					},
				},
				mockOperation,
			),
		).rejects.toThrow(testError);

		expect(mockDestroyAmplifyServerContext).toHaveBeenCalledWith(
			mockContextSpec,
		);
	});

	it('should return the result returned by the operation callback function', async () => {
		const mockResultValue = {
			url: 'http://123.com',
		};
		const mockOperation = jest.fn(() => Promise.resolve(mockResultValue));
		const result = await runWithAmplifyServerContext(
			mockAmplifyConfig,
			{
				Auth: {
					tokenProvider: mockTokenProvider,
					credentialsProvider: mockCredentialAndIdentityProvider,
				},
			},
			mockOperation,
		);

		expect(result).toStrictEqual(mockResultValue);
	});
});

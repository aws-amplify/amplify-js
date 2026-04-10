// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { runWithAmplifyServerContext } from '../../src/adapter-core';
import { configure } from '../../src/configure';

jest.mock('../../src/configure');
const mockConfigure = configure as jest.Mock;

const mockAmplifyConfig = {};
const mockLibraryOptions = {
	Auth: {
		tokenProvider: { getTokens: jest.fn() },
		credentialsProvider: {
			getCredentialsAndIdentityId: jest.fn(),
			clearCredentialsAndIdentityId: jest.fn(),
		},
	},
};

describe('runWithAmplifyServerContext', () => {
	const mockCtx = { resourcesConfig: {}, libraryOptions: {} };

	beforeEach(() => {
		mockConfigure.mockReturnValue(mockCtx);
	});

	afterEach(() => {
		mockConfigure.mockReset();
	});

	it('should call configure and pass the context to the operation', async () => {
		const mockOperation = jest.fn();
		await runWithAmplifyServerContext(
			mockAmplifyConfig,
			mockLibraryOptions,
			mockOperation,
		);

		expect(mockConfigure).toHaveBeenCalledWith(
			mockAmplifyConfig,
			mockLibraryOptions,
		);
		expect(mockOperation).toHaveBeenCalledWith(mockCtx);
	});

	it('should return the result from the operation', async () => {
		const mockResult = { url: 'http://123.com' };
		const mockOperation = jest.fn(() => Promise.resolve(mockResult));
		const result = await runWithAmplifyServerContext(
			mockAmplifyConfig,
			mockLibraryOptions,
			mockOperation,
		);

		expect(result).toStrictEqual(mockResult);
	});

	it('should propagate errors from the operation', async () => {
		const testError = new Error('some error');
		const mockOperation = jest.fn().mockRejectedValueOnce(testError);

		await expect(
			runWithAmplifyServerContext(
				mockAmplifyConfig,
				mockLibraryOptions,
				mockOperation,
			),
		).rejects.toThrow(testError);
	});
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadAmplifyRtnAsf } from '@aws-amplify/react-native';

import { getUserContextData } from '../../../../src/providers/cognito/utils/userContextData.native';

// Mock the @aws-amplify/react-native module
jest.mock('@aws-amplify/react-native', () => ({
	loadAmplifyRtnAsf: jest.fn(),
}));

const mockLoadAmplifyRtnAsf = loadAmplifyRtnAsf as jest.Mock;

describe('getUserContextData.native', () => {
	const mockGetContextData = jest.fn();
	const defaultParams = {
		username: 'testuser',
		userPoolId: 'us-east-1_testpool',
		userPoolClientId: 'testclientid',
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('when native module returns data', () => {
		it('returns { EncodedData } with the encoded string', () => {
			// Given: The native module is available and returns encoded data
			const encodedData = 'base64EncodedContextData';
			mockLoadAmplifyRtnAsf.mockReturnValue({
				getContextData: mockGetContextData,
			});
			mockGetContextData.mockReturnValue(encodedData);

			// When: getUserContextData is called
			const result = getUserContextData(defaultParams);

			// Then: Result should be an object with EncodedData property
			expect(result).toEqual({ EncodedData: encodedData });
		});

		it('calls getContextData with userPoolId and userPoolClientId', () => {
			// Given: The native module is available
			mockLoadAmplifyRtnAsf.mockReturnValue({
				getContextData: mockGetContextData,
			});
			mockGetContextData.mockReturnValue('encodedData');

			// When: getUserContextData is called
			getUserContextData(defaultParams);

			// Then: getContextData should be called with correct parameters
			expect(mockGetContextData).toHaveBeenCalledWith(
				defaultParams.userPoolId,
				defaultParams.userPoolClientId,
			);
		});
	});

	describe('when native module is unavailable', () => {
		it('returns undefined when loadAmplifyRtnAsf returns undefined', () => {
			// Given: The native module is not installed
			mockLoadAmplifyRtnAsf.mockReturnValue(undefined);

			// When: getUserContextData is called
			const result = getUserContextData(defaultParams);

			// Then: Result should be undefined
			expect(result).toBeUndefined();
		});

		it('returns undefined when loadAmplifyRtnAsf returns null', () => {
			// Given: The native module returns null
			mockLoadAmplifyRtnAsf.mockReturnValue(null);

			// When: getUserContextData is called
			const result = getUserContextData(defaultParams);

			// Then: Result should be undefined
			expect(result).toBeUndefined();
		});
	});

	describe('when native module returns null', () => {
		it('returns undefined when getContextData returns null', () => {
			// Given: The native module is available but returns null
			mockLoadAmplifyRtnAsf.mockReturnValue({
				getContextData: mockGetContextData,
			});
			mockGetContextData.mockReturnValue(null);

			// When: getUserContextData is called
			const result = getUserContextData(defaultParams);

			// Then: Result should be undefined
			expect(result).toBeUndefined();
		});

		it('returns undefined when getContextData returns empty string', () => {
			// Given: The native module is available but returns empty string
			mockLoadAmplifyRtnAsf.mockReturnValue({
				getContextData: mockGetContextData,
			});
			mockGetContextData.mockReturnValue('');

			// When: getUserContextData is called
			const result = getUserContextData(defaultParams);

			// Then: Result should be undefined
			expect(result).toBeUndefined();
		});
	});

	describe('when module loader fails', () => {
		it('does not throw when loadAmplifyRtnAsf throws an error', () => {
			// Given: The module loader throws an error
			mockLoadAmplifyRtnAsf.mockImplementation(() => {
				throw new Error('Module not found');
			});

			// When/Then: getUserContextData should not throw
			expect(() => getUserContextData(defaultParams)).not.toThrow();
		});

		it('returns undefined when loadAmplifyRtnAsf throws an error', () => {
			// Given: The module loader throws an error
			mockLoadAmplifyRtnAsf.mockImplementation(() => {
				throw new Error('Module not found');
			});

			// When: getUserContextData is called
			const result = getUserContextData(defaultParams);

			// Then: Result should be undefined
			expect(result).toBeUndefined();
		});

		it('returns undefined when getContextData throws an error', () => {
			// Given: The native module's getContextData throws an error
			mockLoadAmplifyRtnAsf.mockReturnValue({
				getContextData: mockGetContextData,
			});
			mockGetContextData.mockImplementation(() => {
				throw new Error('Native module error');
			});

			// When: getUserContextData is called
			const result = getUserContextData(defaultParams);

			// Then: Result should be undefined
			expect(result).toBeUndefined();
		});

		it('does not throw when getContextData throws an error', () => {
			// Given: The native module's getContextData throws an error
			mockLoadAmplifyRtnAsf.mockReturnValue({
				getContextData: mockGetContextData,
			});
			mockGetContextData.mockImplementation(() => {
				throw new Error('Native module error');
			});

			// When/Then: getUserContextData should not throw
			expect(() => getUserContextData(defaultParams)).not.toThrow();
		});
	});
});

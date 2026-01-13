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
			const encodedData = 'base64EncodedContextData';
			mockLoadAmplifyRtnAsf.mockReturnValue({
				getContextData: mockGetContextData,
			});
			mockGetContextData.mockReturnValue(encodedData);

			const result = getUserContextData(defaultParams);

			expect(result).toEqual({ EncodedData: encodedData });
		});

		it('calls getContextData with userPoolId and userPoolClientId', () => {
			mockLoadAmplifyRtnAsf.mockReturnValue({
				getContextData: mockGetContextData,
			});
			mockGetContextData.mockReturnValue('encodedData');

			getUserContextData(defaultParams);

			expect(mockGetContextData).toHaveBeenCalledWith(
				defaultParams.userPoolId,
				defaultParams.userPoolClientId,
			);
		});
	});

	describe('when native module is unavailable', () => {
		it('returns undefined when loadAmplifyRtnAsf returns undefined', () => {
			mockLoadAmplifyRtnAsf.mockReturnValue(undefined);

			const result = getUserContextData(defaultParams);

			expect(result).toBeUndefined();
		});

		it('returns undefined when loadAmplifyRtnAsf returns null', () => {
			mockLoadAmplifyRtnAsf.mockReturnValue(null);

			const result = getUserContextData(defaultParams);

			expect(result).toBeUndefined();
		});
	});

	describe('when native module returns null', () => {
		it('returns undefined when getContextData returns null', () => {
			mockLoadAmplifyRtnAsf.mockReturnValue({
				getContextData: mockGetContextData,
			});
			mockGetContextData.mockReturnValue(null);

			const result = getUserContextData(defaultParams);

			expect(result).toBeUndefined();
		});

		it('returns undefined when getContextData returns empty string', () => {
			mockLoadAmplifyRtnAsf.mockReturnValue({
				getContextData: mockGetContextData,
			});
			mockGetContextData.mockReturnValue('');

			const result = getUserContextData(defaultParams);

			expect(result).toBeUndefined();
		});
	});

	describe('when module loader fails', () => {
		it('does not throw when loadAmplifyRtnAsf throws an error', () => {
			mockLoadAmplifyRtnAsf.mockImplementation(() => {
				throw new Error('Module not found');
			});

			expect(() => getUserContextData(defaultParams)).not.toThrow();
		});

		it('returns undefined when loadAmplifyRtnAsf throws an error', () => {
			mockLoadAmplifyRtnAsf.mockImplementation(() => {
				throw new Error('Module not found');
			});

			const result = getUserContextData(defaultParams);

			expect(result).toBeUndefined();
		});

		it('returns undefined when getContextData throws an error', () => {
			mockLoadAmplifyRtnAsf.mockReturnValue({
				getContextData: mockGetContextData,
			});
			mockGetContextData.mockImplementation(() => {
				throw new Error('Native module error');
			});

			const result = getUserContextData(defaultParams);

			expect(result).toBeUndefined();
		});

		it('does not throw when getContextData throws an error', () => {
			mockLoadAmplifyRtnAsf.mockReturnValue({
				getContextData: mockGetContextData,
			});
			mockGetContextData.mockImplementation(() => {
				throw new Error('Native module error');
			});

			expect(() => getUserContextData(defaultParams)).not.toThrow();
		});
	});
});

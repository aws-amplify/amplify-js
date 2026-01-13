// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as fc from 'fast-check';
import { loadAmplifyRtnAsf } from '@aws-amplify/react-native';

import { getUserContextData } from '../../../../src/providers/cognito/utils/userContextData.native';

// Mock the @aws-amplify/react-native module
jest.mock('@aws-amplify/react-native', () => ({
	loadAmplifyRtnAsf: jest.fn(),
}));

const mockLoadAmplifyRtnAsf = loadAmplifyRtnAsf as jest.Mock;

/**
 * **Feature: native-asf-context-data, Property 3: Output Format Transformation**
 * **Validates: Requirements 3.2**
 */
describe('getUserContextData Property Tests', () => {
	const mockGetContextData = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		// Reset default mock setup
		mockLoadAmplifyRtnAsf.mockReturnValue({
			getContextData: mockGetContextData,
		});
	});

	it('Property 3: Output Format Transformation - returns object with EncodedData property', () => {
		fc.assert(
			fc.property(fc.string({ minLength: 1 }), encodedData => {
				mockGetContextData.mockReturnValue(encodedData);

				const result = getUserContextData({
					username: 'testuser',
					userPoolId: 'us-east-1_testpool',
					userPoolClientId: 'testclientid',
				});

				expect(result).toBeDefined();
				expect(result).toEqual({ EncodedData: encodedData });
				expect(Object.keys(result!).length).toBe(1);
				expect(result!.EncodedData).toBe(encodedData);
			}),
			{ numRuns: 100 },
		);
	});

	/**
	 * **Feature: native-asf-context-data, Property 4: Null to Undefined Mapping**
	 * **Validates: Requirements 3.3, 3.4**
	 */
	it('Property 4: Null to Undefined Mapping - returns undefined when native module returns null', () => {
		fc.assert(
			fc.property(
				fc.record({
					username: fc.string({ minLength: 1 }),
					userPoolId: fc.string({ minLength: 1 }),
					userPoolClientId: fc.string({ minLength: 1 }),
				}),
				params => {
					mockGetContextData.mockReturnValue(null);

					const result = getUserContextData(params);

					expect(result).toBeUndefined();
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * **Feature: native-asf-context-data, Property 4: Null to Undefined Mapping**
	 * **Validates: Requirements 3.3, 3.4**
	 */
	it('Property 4: Null to Undefined Mapping - returns undefined when native module is unavailable', () => {
		fc.assert(
			fc.property(
				fc.record({
					username: fc.string({ minLength: 1 }),
					userPoolId: fc.string({ minLength: 1 }),
					userPoolClientId: fc.string({ minLength: 1 }),
				}),
				params => {
					mockLoadAmplifyRtnAsf.mockReturnValue(undefined);

					const result = getUserContextData(params);

					expect(result).toBeUndefined();
				},
			),
			{ numRuns: 100 },
		);
	});
});

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
 *
 * Property: For any non-null string returned by the native module's getContextData,
 * the getUserContextData function SHALL return an object with exactly one property
 * EncodedData containing that string.
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
			fc.property(
				// Generate non-empty strings to simulate encoded data from native module
				fc.string({ minLength: 1 }),
				encodedData => {
					// Given: The native module returns a non-empty encoded data string
					mockGetContextData.mockReturnValue(encodedData);

					// When: getUserContextData is called
					const result = getUserContextData({
						username: 'testuser',
						userPoolId: 'us-east-1_testpool',
						userPoolClientId: 'testclientid',
					});

					// Then: Result should be an object with exactly one property 'EncodedData'
					// containing the encoded data string
					expect(result).toBeDefined();
					expect(result).toEqual({ EncodedData: encodedData });
					expect(Object.keys(result!).length).toBe(1);
					expect(result!.EncodedData).toBe(encodedData);
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * **Feature: native-asf-context-data, Property 4: Null to Undefined Mapping**
	 * **Validates: Requirements 3.3, 3.4**
	 *
	 * Property: For any call to getUserContextData where the native module returns null
	 * or is unavailable, the function SHALL return undefined (not null, not an empty
	 * object, not throwing).
	 */
	it('Property 4: Null to Undefined Mapping - returns undefined when native module returns null', () => {
		fc.assert(
			fc.property(
				// Generate arbitrary valid input parameters
				fc.record({
					username: fc.string({ minLength: 1 }),
					userPoolId: fc.string({ minLength: 1 }),
					userPoolClientId: fc.string({ minLength: 1 }),
				}),
				params => {
					// Given: The native module returns null
					mockGetContextData.mockReturnValue(null);

					// When: getUserContextData is called
					const result = getUserContextData(params);

					// Then: Result should be exactly undefined
					expect(result).toBeUndefined();
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * **Feature: native-asf-context-data, Property 4: Null to Undefined Mapping**
	 * **Validates: Requirements 3.3, 3.4**
	 *
	 * Property: For any call to getUserContextData where the native module is unavailable,
	 * the function SHALL return undefined (not null, not an empty object, not throwing).
	 */
	it('Property 4: Null to Undefined Mapping - returns undefined when native module is unavailable', () => {
		fc.assert(
			fc.property(
				// Generate arbitrary valid input parameters
				fc.record({
					username: fc.string({ minLength: 1 }),
					userPoolId: fc.string({ minLength: 1 }),
					userPoolClientId: fc.string({ minLength: 1 }),
				}),
				params => {
					// Given: The native module is unavailable (loadAmplifyRtnAsf returns undefined)
					mockLoadAmplifyRtnAsf.mockReturnValue(undefined);

					// When: getUserContextData is called
					const result = getUserContextData(params);

					// Then: Result should be exactly undefined
					expect(result).toBeUndefined();
				},
			),
			{ numRuns: 100 },
		);
	});
});

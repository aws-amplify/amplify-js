// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LINKING_ERROR } from '../src/constants';

// Mock React Native before importing nativeModule
jest.mock('react-native', () => ({
	NativeModules: {},
	Platform: {
		select: jest.fn().mockReturnValue(''),
	},
}));

describe('nativeModule', () => {
	beforeEach(() => {
		jest.resetModules();
	});

	it('returns native module when available', () => {
		const mockModule = { openAuthSessionAsync: jest.fn() };

		jest.doMock('react-native', () => ({
			NativeModules: {
				AmplifyRTNWebBrowser: mockModule,
			},
			Platform: {
				select: jest.fn().mockReturnValue(''),
			},
		}));

		const { nativeModule } = require('../src/nativeModule');
		expect(nativeModule).toBe(mockModule);
		// Test that the module actually works
		nativeModule.openAuthSessionAsync('test');
		expect(mockModule.openAuthSessionAsync).toHaveBeenCalledWith('test');
	});

	it('throws error when native module not available', () => {
		jest.doMock('react-native', () => ({
			NativeModules: {},
			Platform: {
				select: jest.fn().mockReturnValue(''),
			},
		}));

		const { nativeModule } = require('../src/nativeModule');
		expect(() => nativeModule.openAuthSessionAsync('test')).toThrow(
			LINKING_ERROR,
		);
	});

	it('throws error for any method call when module unavailable', () => {
		jest.doMock('react-native', () => ({
			NativeModules: {},
			Platform: {
				select: jest.fn().mockReturnValue(''),
			},
		}));

		const { nativeModule } = require('../src/nativeModule');
		expect(() => nativeModule.someOtherMethod()).toThrow(LINKING_ERROR);
	});
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

describe('nativeModule', () => {
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	it('should return NativeModules.AmplifyRTNCore when available', () => {
		const mockModule = { computeModPow: jest.fn() };
		jest.doMock('react-native', () => ({
			NativeModules: { AmplifyRTNCore: mockModule },
			Platform: { select: jest.fn() },
		}));

		const { nativeModule } = require('../src/nativeModule');
		expect(nativeModule).toBe(mockModule);
	});

	it('should return NativeModules.AmplifyRTNCore when it exists as empty object', () => {
		const mockModule = {};
		jest.doMock('react-native', () => ({
			NativeModules: { AmplifyRTNCore: mockModule },
			Platform: { select: jest.fn() },
		}));

		const { nativeModule } = require('../src/nativeModule');
		expect(nativeModule).toBe(mockModule);
	});

	it('should return proxy that throws error when AmplifyRTNCore is not available', () => {
		jest.doMock('react-native', () => ({
			NativeModules: {},
			Platform: { select: () => "- You have run 'pod install'\n" },
		}));

		const { nativeModule } = require('../src/nativeModule');

		expect(() => nativeModule.computeModPow()).toThrow(
			"The package '@aws-amplify/react-native' doesn't seem to be linked.",
		);
	});

	it('should handle Platform.select returning empty string', () => {
		jest.doMock('react-native', () => ({
			NativeModules: {},
			Platform: { select: () => '' },
		}));

		const { nativeModule } = require('../src/nativeModule');

		expect(() => nativeModule.anyMethod()).toThrow(
			"The package '@aws-amplify/react-native' doesn't seem to be linked.",
		);
	});
});

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

jest.mock('react-native', () => ({
	Platform: { OS: 'ios', select: jest.fn(() => '') },
	NativeModules: {
		AmplifyRTNCore: {
			computeModPow: jest.fn(),
			computeS: jest.fn(),
			getDeviceName: jest.fn(),
		},
	},
	AppState: { currentState: 'active' },
}));

jest.mock('buffer', () => ({ Buffer: {} }));
jest.mock('base-64', () => ({ decode: jest.fn(), encode: jest.fn() }));

describe('@aws-amplify/react-native', () => {
	it('should export all APIs', () => {
		const ReactNativeModule = require('../src/index');
		expect(ReactNativeModule.computeModPow).toBeDefined();
		expect(ReactNativeModule.computeS).toBeDefined();
		expect(ReactNativeModule.getOperatingSystem).toBeDefined();
		expect(ReactNativeModule.getDeviceName).toBeDefined();
	});

	it('should export all module loaders', () => {
		const ReactNativeModule = require('../src/index');
		expect(ReactNativeModule.loadAmplifyPushNotification).toBeDefined();
		expect(ReactNativeModule.loadAmplifyWebBrowser).toBeDefined();
		expect(ReactNativeModule.loadAsyncStorage).toBeDefined();
		expect(ReactNativeModule.loadNetInfo).toBeDefined();
		expect(ReactNativeModule.loadBuffer).toBeDefined();
		expect(ReactNativeModule.loadUrlPolyfill).toBeDefined();
		expect(ReactNativeModule.loadGetRandomValues).toBeDefined();
		expect(ReactNativeModule.loadBase64).toBeDefined();
		expect(ReactNativeModule.loadAppState).toBeDefined();
	});
});

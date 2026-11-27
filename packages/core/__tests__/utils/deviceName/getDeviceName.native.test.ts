// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const mockPlatform: {
	OS: string;
	isPad?: boolean;
	constants?: Record<string, unknown>;
	select(spec: Record<string, string>): string;
} = { OS: 'ios', select: spec => spec.default ?? '' };
const mockNativeModules: Record<string, unknown> = {};

jest.mock('react-native', () => ({
	NativeModules: mockNativeModules,
	Platform: mockPlatform,
}));

const loadGetDeviceName = () => {
	let getDeviceName: () => Promise<string> = () => Promise.resolve('');
	jest.isolateModules(() => {
		({
			getDeviceName,
		} = require('../../../src/utils/deviceName/getDeviceName.native'));
	});

	return getDeviceName;
};

describe('getDeviceName (React Native)', () => {
	afterEach(() => {
		mockPlatform.OS = 'ios';
		delete mockPlatform.isPad;
		delete mockPlatform.constants;
		delete mockNativeModules.AmplifyRTNCore;
	});

	it('uses the AmplifyRTNCore native module when it is linked', async () => {
		mockNativeModules.AmplifyRTNCore = {
			getDeviceName: jest.fn().mockResolvedValue("Jane's iPhone"),
		};
		expect(await loadGetDeviceName()()).toBe("Jane's iPhone");
	});

	it('resolves a name on iOS when the native module is not linked', async () => {
		expect(await loadGetDeviceName()()).toBe('iPhone');
	});

	it('resolves the model on Android when the native module is not linked', async () => {
		mockPlatform.OS = 'android';
		mockPlatform.constants = { Model: 'Pixel 9' };
		expect(await loadGetDeviceName()()).toBe('Pixel 9');
	});
});

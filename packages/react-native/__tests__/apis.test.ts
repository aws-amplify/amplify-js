// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	computeModPow,
	computeS,
	getDeviceName,
	getOperatingSystem,
} from '../src/apis';
import { nativeModule } from '../src/nativeModule';

jest.mock('react-native', () => ({
	Platform: { OS: 'ios' },
	NativeModules: {},
}));

jest.mock('../src/nativeModule', () => ({
	nativeModule: {
		computeModPow: jest.fn(),
		computeS: jest.fn(),
		getDeviceName: jest.fn(),
	},
}));

describe('APIs', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('getOperatingSystem', () => {
		it('should return Platform.OS', () => {
			expect(getOperatingSystem()).toBe('ios');
		});
	});

	describe('computeModPow', () => {
		it('should call nativeModule.computeModPow with payload', () => {
			const payload = { base: '2', exponent: '3', divisor: '5' };
			computeModPow(payload);
			expect(nativeModule.computeModPow).toHaveBeenCalledWith(payload);
		});
	});

	describe('computeS', () => {
		it('should call nativeModule.computeS with payload', () => {
			const payload = { g: '1', x: '2', k: '3', a: '4', b: '5', u: '6' };
			computeS(payload);
			expect(nativeModule.computeS).toHaveBeenCalledWith(payload);
		});
	});

	describe('getDeviceName', () => {
		it('should call nativeModule.getDeviceName', () => {
			getDeviceName();
			expect(nativeModule.getDeviceName).toHaveBeenCalled();
		});
	});
});

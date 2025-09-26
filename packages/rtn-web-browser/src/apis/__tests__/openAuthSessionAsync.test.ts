// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Platform } from 'react-native';

import { nativeModule } from '../../nativeModule';
import { isChromebook, openAuthSessionAsync } from '../openAuthSessionAsync';

jest.mock('react-native', () => ({
	Platform: { OS: 'ios' },
	AppState: { addEventListener: jest.fn() },
	Linking: { addEventListener: jest.fn() },
	NativeModules: {},
}));

jest.mock('../../nativeModule', () => ({
	nativeModule: { openAuthSessionAsync: jest.fn() },
}));

const mockPlatform = Platform as jest.Mocked<typeof Platform>;
const mockNativeModule = nativeModule as jest.Mocked<typeof nativeModule>;

describe('openAuthSessionAsync', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockPlatform.OS = 'ios';
	});

	describe('isChromebook', () => {
		it('returns false by default', async () => {
			const result = await isChromebook();
			expect(result).toBe(false);
		});
	});

	describe('openAuthSessionAsync', () => {
		it('enforces HTTPS on URLs', async () => {
			mockNativeModule.openAuthSessionAsync.mockResolvedValue('result');

			await openAuthSessionAsync('http://example.com', ['myapp://callback']);

			expect(mockNativeModule.openAuthSessionAsync).toHaveBeenCalledWith(
				'https://example.com',
				'myapp://callback',
				false,
			);
		});

		it('calls iOS implementation', async () => {
			mockNativeModule.openAuthSessionAsync.mockResolvedValue('result');

			const result = await openAuthSessionAsync(
				'https://example.com',
				['myapp://callback'],
				true,
			);

			expect(result).toBe('result');
			expect(mockNativeModule.openAuthSessionAsync).toHaveBeenCalledWith(
				'https://example.com',
				'myapp://callback',
				true,
			);
		});

		it('finds first non-web URL for redirect', async () => {
			const redirectUrls = ['https://web.com', 'myapp://deep'];

			await openAuthSessionAsync('https://example.com', redirectUrls);

			expect(mockNativeModule.openAuthSessionAsync).toHaveBeenCalledWith(
				'https://example.com',
				'myapp://deep',
				false,
			);
		});
	});
});

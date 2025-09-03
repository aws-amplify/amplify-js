// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AppState, Linking, Platform } from 'react-native';

import { openAuthSessionAsync } from '../../src/apis/openAuthSessionAsync';
import { nativeModule } from '../../src/nativeModule';
import {
	mockDeepLinkUrl,
	mockRedirectUrls,
	mockReturnUrl,
	mockUrl,
} from '../testUtils/data';

// Mock React Native modules
jest.mock('react-native', () => ({
	Platform: { OS: 'ios' },
	AppState: {
		currentState: 'active',
		addEventListener: jest.fn(),
	},
	Linking: {
		addEventListener: jest.fn(),
	},
}));

// Mock EmitterSubscription type
const mockEmitterSubscription = {
	remove: jest.fn(),
	emitter: {},
	listener: jest.fn(),
	context: {},
	eventType: 'test',
	key: 'test-key',
	subscriber: {},
} as any;

// Mock native module
jest.mock('../../src/nativeModule', () => ({
	nativeModule: {
		openAuthSessionAsync: jest.fn(),
	},
}));

describe('openAuthSessionAsync', () => {
	const mockNativeModule = nativeModule.openAuthSessionAsync as jest.Mock;
	const mockPlatform = Platform as jest.Mocked<typeof Platform>;
	const mockAppState = AppState as jest.Mocked<typeof AppState>;
	const mockLinking = Linking as jest.Mocked<typeof Linking>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('iOS platform', () => {
		beforeEach(() => {
			mockPlatform.OS = 'ios';
		});

		it('calls iOS native module with correct parameters', async () => {
			mockNativeModule.mockResolvedValue(mockReturnUrl);

			const result = await openAuthSessionAsync(mockUrl, mockRedirectUrls);

			expect(mockNativeModule).toHaveBeenCalledWith(
				'https://example.com/auth',
				mockDeepLinkUrl,
				false,
			);
			expect(result).toBe(mockReturnUrl);
		});

		it('enforces HTTPS URLs', async () => {
			const httpUrl = 'http://example.com/auth';
			mockNativeModule.mockResolvedValue(mockReturnUrl);

			await openAuthSessionAsync(httpUrl, mockRedirectUrls);

			expect(mockNativeModule).toHaveBeenCalledWith(
				'https://example.com/auth',
				mockDeepLinkUrl,
				false,
			);
		});

		it('passes prefersEphemeralSession parameter', async () => {
			mockNativeModule.mockResolvedValue(mockReturnUrl);

			await openAuthSessionAsync(mockUrl, mockRedirectUrls, true);

			expect(mockNativeModule).toHaveBeenCalledWith(
				'https://example.com/auth',
				mockDeepLinkUrl,
				true,
			);
		});

		it('finds first non-web redirect URL', async () => {
			const redirectUrls = [
				'https://web.com',
				'myapp://callback',
				'anotherapp://test',
			];
			mockNativeModule.mockResolvedValue(mockReturnUrl);

			await openAuthSessionAsync(mockUrl, redirectUrls);

			expect(mockNativeModule).toHaveBeenCalledWith(
				'https://example.com/auth',
				'myapp://callback',
				false,
			);
		});

		it('handles undefined redirect URL when no deep links found', async () => {
			const webOnlyUrls = ['https://web.com', 'http://another.com'];
			mockNativeModule.mockResolvedValue(mockReturnUrl);

			await openAuthSessionAsync(mockUrl, webOnlyUrls);

			expect(mockNativeModule).toHaveBeenCalledWith(
				'https://example.com/auth',
				undefined,
				false,
			);
		});
	});

	describe('Android platform', () => {
		beforeEach(() => {
			mockPlatform.OS = 'android';
			mockAppState.currentState = 'active';
		});

		it('sets up listeners and calls native module', async () => {
			const mockAppStateListener = { ...mockEmitterSubscription };
			const mockLinkingListener = { ...mockEmitterSubscription };

			mockAppState.addEventListener.mockReturnValue(mockAppStateListener);
			mockLinking.addEventListener.mockReturnValue(mockLinkingListener);
			mockNativeModule.mockResolvedValue(undefined);

			// Simulate app state change from background to active
			mockAppState.currentState = 'background';
			mockAppState.addEventListener.mockImplementation((event, callback) => {
				// Immediately trigger the callback to resolve the promise
				setTimeout(() => {
					callback('active');
				}, 0);

				return mockAppStateListener;
			});

			const result = await openAuthSessionAsync(mockUrl, mockRedirectUrls);

			expect(mockNativeModule).toHaveBeenCalledWith('https://example.com/auth');
			expect(mockAppState.addEventListener).toHaveBeenCalledWith(
				'change',
				expect.any(Function),
			);
			expect(mockLinking.addEventListener).toHaveBeenCalledWith(
				'url',
				expect.any(Function),
			);
			expect(result).toBeNull();
		}, 10000);

		it('resolves with redirect URL when matching URL received', async () => {
			const mockAppStateListener = { ...mockEmitterSubscription };
			const mockLinkingListener = { ...mockEmitterSubscription };

			mockAppState.addEventListener.mockReturnValue(mockAppStateListener);
			mockLinking.addEventListener.mockImplementation((event, callback) => {
				// Immediately trigger the callback to resolve the promise
				setTimeout(() => {
					callback({ url: mockReturnUrl });
				}, 0);

				return mockLinkingListener;
			});
			mockNativeModule.mockResolvedValue(undefined);

			const result = await openAuthSessionAsync(mockUrl, mockRedirectUrls);

			expect(result).toBe(mockReturnUrl);
		}, 10000);

		it('ignores non-matching redirect URLs', async () => {
			const mockAppStateListener = { ...mockEmitterSubscription };
			const mockLinkingListener = { ...mockEmitterSubscription };

			mockAppState.currentState = 'background';
			let appStateCallback: any;

			mockAppState.addEventListener.mockImplementation((event, callback) => {
				appStateCallback = callback;

				return mockAppStateListener;
			});

			mockLinking.addEventListener.mockImplementation((event, callback) => {
				// First call with non-matching URL (should be ignored)
				setTimeout(() => {
					callback({ url: 'other://app' });
				}, 0);
				// Then trigger app state change to resolve
				setTimeout(() => {
					appStateCallback('active');
				}, 10);

				return mockLinkingListener;
			});

			mockNativeModule.mockResolvedValue(undefined);

			const result = await openAuthSessionAsync(mockUrl, mockRedirectUrls);

			expect(result).toBeNull();
		}, 10000);

		it('cleans up listeners after completion', async () => {
			const mockAppStateListener = { ...mockEmitterSubscription };
			const mockLinkingListener = { ...mockEmitterSubscription };

			mockAppState.currentState = 'background';
			mockAppState.addEventListener.mockReturnValue(mockAppStateListener);
			mockLinking.addEventListener.mockReturnValue(mockLinkingListener);
			mockNativeModule.mockResolvedValue(undefined);

			mockAppState.addEventListener.mockImplementation((event, callback) => {
				setTimeout(() => {
					callback('active');
				}, 0);

				return mockAppStateListener;
			});

			await openAuthSessionAsync(mockUrl, mockRedirectUrls);

			expect(mockAppStateListener.remove).toHaveBeenCalled();
			expect(mockLinkingListener.remove).toHaveBeenCalled();
		}, 10000);

		it('handles app state transition from background to active', async () => {
			const mockAppStateListener = { ...mockEmitterSubscription };
			const mockLinkingListener = { ...mockEmitterSubscription };

			// Set initial state to background to test the transition
			mockAppState.currentState = 'background';
			mockAppState.addEventListener.mockReturnValue(mockAppStateListener);
			mockLinking.addEventListener.mockReturnValue(mockLinkingListener);
			mockNativeModule.mockResolvedValue(undefined);

			mockAppState.addEventListener.mockImplementation((event, callback) => {
				// Simulate transition from background to active
				setTimeout(() => {
					callback('active');
				}, 0);

				return mockAppStateListener;
			});

			const result = await openAuthSessionAsync(mockUrl, mockRedirectUrls);

			expect(result).toBeNull();
		}, 10000);

		it('handles app state change when already active', async () => {
			const mockAppStateListener = { ...mockEmitterSubscription };
			const mockLinkingListener = { ...mockEmitterSubscription };

			// Set initial state to active
			mockAppState.currentState = 'active';
			mockAppState.addEventListener.mockReturnValue(mockAppStateListener);
			mockLinking.addEventListener.mockReturnValue(mockLinkingListener);
			mockNativeModule.mockResolvedValue(undefined);

			mockAppState.addEventListener.mockImplementation((event, callback) => {
				// Simulate state change from active to background then back to active
				setTimeout(() => {
					callback('background'); // This should not trigger resolve
					setTimeout(() => {
						callback('active');
					}, 0); // This should trigger resolve
				}, 0);

				return mockAppStateListener;
			});

			const result = await openAuthSessionAsync(mockUrl, mockRedirectUrls);

			expect(result).toBeNull();
		}, 10000);
	});

	describe('unsupported platform', () => {
		it('returns undefined for unsupported platforms', async () => {
			mockPlatform.OS = 'web' as any;

			const result = await openAuthSessionAsync(mockUrl, mockRedirectUrls);

			expect(result).toBeUndefined();
			expect(mockNativeModule).not.toHaveBeenCalled();
		});
	});
});

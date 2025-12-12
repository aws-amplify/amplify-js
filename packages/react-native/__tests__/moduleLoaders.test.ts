// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

describe('Module Loaders', () => {
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	describe('loadBuffer', () => {
		it('should return Buffer', () => {
			const mockBuffer = { from: jest.fn() };
			jest.doMock('buffer', () => ({ Buffer: mockBuffer }));
			const { loadBuffer } = require('../src/moduleLoaders/loadBuffer');
			expect(loadBuffer()).toBe(mockBuffer);
		});
	});

	describe('loadBase64', () => {
		it('should return decode and encode functions', () => {
			const mockDecode = jest.fn();
			const mockEncode = jest.fn();
			jest.doMock('base-64', () => ({
				decode: mockDecode,
				encode: mockEncode,
			}));
			const { loadBase64 } = require('../src/moduleLoaders/loadBase64');
			const result = loadBase64();
			expect(result.decode).toBe(mockDecode);
			expect(result.encode).toBe(mockEncode);
		});
	});

	describe('loadAppState', () => {
		it('should return AppState', () => {
			const mockAppState = { currentState: 'active' };
			jest.doMock('react-native', () => ({ AppState: mockAppState }));
			const { loadAppState } = require('../src/moduleLoaders/loadAppState');
			expect(loadAppState()).toBe(mockAppState);
		});
	});

	describe('loadAsyncStorage', () => {
		it('should return AsyncStorage module when available', () => {
			const mockAsyncStorage = { getItem: jest.fn() };
			jest.doMock('@react-native-async-storage/async-storage', () => ({
				default: mockAsyncStorage,
			}));

			const {
				loadAsyncStorage,
			} = require('../src/moduleLoaders/loadAsyncStorage');
			expect(loadAsyncStorage()).toBe(mockAsyncStorage);
		});

		it('should throw error when AsyncStorage is not available', () => {
			jest.doMock('@react-native-async-storage/async-storage', () => {
				throw new Error('Cannot resolve module undefined');
			});

			const {
				loadAsyncStorage,
			} = require('../src/moduleLoaders/loadAsyncStorage');
			expect(() => loadAsyncStorage()).toThrow(
				'@react-native-async-storage/async-storage',
			);
		});

		it('should throw error when AsyncStorage default is null', () => {
			jest.doMock('@react-native-async-storage/async-storage', () => ({
				default: null,
			}));

			const {
				loadAsyncStorage,
			} = require('../src/moduleLoaders/loadAsyncStorage');
			expect(() => loadAsyncStorage()).toThrow(
				'Ensure `@react-native-async-storage/async-storage` is installed and linked.',
			);
		});
	});

	describe('loadNetInfo', () => {
		it('should return NetInfo module when available', () => {
			const mockNetInfo = { fetch: jest.fn() };
			jest.doMock('@react-native-community/netinfo', () => ({
				default: mockNetInfo,
			}));

			const { loadNetInfo } = require('../src/moduleLoaders/loadNetInfo');
			expect(loadNetInfo()).toBe(mockNetInfo);
		});

		it('should throw error when NetInfo is not available', () => {
			jest.doMock('@react-native-community/netinfo', () => {
				throw new Error('Cannot resolve module undefined');
			});

			const { loadNetInfo } = require('../src/moduleLoaders/loadNetInfo');
			expect(() => loadNetInfo()).toThrow('@react-native-community/netinfo');
		});

		it('should throw error when NetInfo default is null', () => {
			jest.doMock('@react-native-community/netinfo', () => ({
				default: null,
			}));

			const { loadNetInfo } = require('../src/moduleLoaders/loadNetInfo');
			expect(() => loadNetInfo()).toThrow(
				'Ensure `@react-native-community/netinfo` is installed and linked.',
			);
		});
	});

	describe('loadAmplifyPushNotification', () => {
		it('should return push notification module when available', () => {
			const mockModule = { initialize: jest.fn() };
			jest.doMock('@aws-amplify/rtn-push-notification', () => ({
				module: mockModule,
			}));

			const {
				loadAmplifyPushNotification,
			} = require('../src/moduleLoaders/loadAmplifyPushNotification');
			expect(loadAmplifyPushNotification()).toBe(mockModule);
		});

		it('should throw error when push notification module is not available', () => {
			jest.doMock('@aws-amplify/rtn-push-notification', () => {
				throw new Error('Cannot resolve module undefined');
			});

			const {
				loadAmplifyPushNotification,
			} = require('../src/moduleLoaders/loadAmplifyPushNotification');
			expect(() => loadAmplifyPushNotification()).toThrow(
				'@aws-amplify/rtn-push-notification',
			);
		});

		it('should throw error when push notification module is null', () => {
			jest.doMock('@aws-amplify/rtn-push-notification', () => ({
				module: null,
			}));

			const {
				loadAmplifyPushNotification,
			} = require('../src/moduleLoaders/loadAmplifyPushNotification');
			expect(() => loadAmplifyPushNotification()).toThrow(
				'Ensure `@aws-amplify/rtn-push-notification` is installed and linked.',
			);
		});
	});

	describe('loadAmplifyWebBrowser', () => {
		it('should return web browser module when available', () => {
			const mockModule = { openAuthSessionAsync: jest.fn() };
			jest.doMock('@aws-amplify/rtn-web-browser', () => ({
				module: mockModule,
			}));

			const {
				loadAmplifyWebBrowser,
			} = require('../src/moduleLoaders/loadAmplifyWebBrowser');
			expect(loadAmplifyWebBrowser()).toBe(mockModule);
		});

		it('should throw error when web browser module is not available', () => {
			jest.doMock('@aws-amplify/rtn-web-browser', () => {
				throw new Error('Cannot resolve module undefined');
			});

			const {
				loadAmplifyWebBrowser,
			} = require('../src/moduleLoaders/loadAmplifyWebBrowser');
			expect(() => loadAmplifyWebBrowser()).toThrow(
				'@aws-amplify/rtn-web-browser',
			);
		});

		it('should throw error when web browser module is null', () => {
			jest.doMock('@aws-amplify/rtn-web-browser', () => ({
				module: null,
			}));

			const {
				loadAmplifyWebBrowser,
			} = require('../src/moduleLoaders/loadAmplifyWebBrowser');
			expect(() => loadAmplifyWebBrowser()).toThrow(
				'Ensure `@aws-amplify/rtn-web-browser` is installed and linked.',
			);
		});
	});

	describe('loadUrlPolyfill', () => {
		it('should require react-native-url-polyfill/auto successfully', () => {
			jest.doMock('react-native-url-polyfill/auto', () => ({}));

			const {
				loadUrlPolyfill,
			} = require('../src/moduleLoaders/loadUrlPolyfill');
			expect(() => loadUrlPolyfill()).not.toThrow();
		});

		it('should throw error when url polyfill is not available', () => {
			jest.doMock('react-native-url-polyfill/auto', () => {
				throw new Error('Cannot resolve module undefined');
			});

			const {
				loadUrlPolyfill,
			} = require('../src/moduleLoaders/loadUrlPolyfill');
			expect(() => loadUrlPolyfill()).toThrow('react-native-url-polyfill');
		});
	});

	describe('loadGetRandomValues', () => {
		it('should require react-native-get-random-values successfully', () => {
			jest.doMock('react-native-get-random-values', () => ({}));

			const {
				loadGetRandomValues,
			} = require('../src/moduleLoaders/loadGetRandomValues');
			expect(() => loadGetRandomValues()).not.toThrow();
		});

		it('should throw error when get random values is not available', () => {
			jest.doMock('react-native-get-random-values', () => {
				throw new Error('Cannot resolve module undefined');
			});

			const {
				loadGetRandomValues,
			} = require('../src/moduleLoaders/loadGetRandomValues');
			expect(() => loadGetRandomValues()).toThrow(
				'react-native-get-random-values',
			);
		});
	});

	describe('loadAmplifyRtnAsf', () => {
		it('should return module when package is installed', () => {
			const mockModule = { getContextData: jest.fn() };
			jest.doMock('@aws-amplify/rtn-asf', () => ({
				module: mockModule,
			}));

			const {
				loadAmplifyRtnAsf,
			} = require('../src/moduleLoaders/loadAmplifyRtnAsf');
			expect(loadAmplifyRtnAsf()).toBe(mockModule);
		});

		it('should return undefined when package is not installed', () => {
			jest.doMock('@aws-amplify/rtn-asf', () => {
				throw new Error('Cannot find module');
			});

			const {
				loadAmplifyRtnAsf,
			} = require('../src/moduleLoaders/loadAmplifyRtnAsf');
			expect(loadAmplifyRtnAsf()).toBeUndefined();
		});

		it('should return undefined when require throws', () => {
			jest.doMock('@aws-amplify/rtn-asf', () => {
				throw new Error('Cannot resolve module undefined');
			});

			const {
				loadAmplifyRtnAsf,
			} = require('../src/moduleLoaders/loadAmplifyRtnAsf');
			expect(loadAmplifyRtnAsf()).toBeUndefined();
		});
	});
});

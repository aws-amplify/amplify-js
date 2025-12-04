import { ConsoleLogger } from '@aws-amplify/core';
import { AWSAppSyncRealTimeProvider } from '../src/Providers/AWSAppSyncRealTimeProvider';
import { ConnectionState as CS } from '../src/types/PubSub';
import { FakeWebSocketInterface } from './helpers';

// Mock storage for testing
const mockStorage = {
	data: new Map<string, string>(),
	setItem: jest.fn((key: string, value: string) => {
		mockStorage.data.set(key, value);
		return Promise.resolve();
	}),
	getItem: jest.fn((key: string) => {
		return Promise.resolve(mockStorage.data.get(key) || null);
	}),
	clear: () => {
		mockStorage.data.clear();
		mockStorage.setItem.mockClear();
		mockStorage.getItem.mockClear();
	},
};

// Mock localStorage
Object.defineProperty(global, 'localStorage', {
	value: mockStorage,
	writable: true,
});

// Mock signRequest
jest.mock('@aws-amplify/core/internals/aws-client-utils', () => ({
	...jest.requireActual('@aws-amplify/core/internals/aws-client-utils'),
	signRequest: () => ({
		method: 'test',
		headers: { test: 'test' },
		url: new URL('http://example/'),
	}),
}));

// Mock fetchAuthSession
jest.mock('@aws-amplify/core', () => {
	const original = jest.requireActual('@aws-amplify/core');
	return {
		...original,
		fetchAuthSession: () =>
			Promise.resolve({
				tokens: {
					accessToken: {
						toString: () => 'test',
					},
				},
				credentials: {
					accessKeyId: 'test',
					secretAccessKey: 'test',
				},
			}),
		Amplify: {
			Auth: {
				fetchAuthSession: async () => ({
					tokens: {
						accessToken: {
							toString: () => 'test',
						},
					},
					credentials: {
						accessKeyId: 'test',
						secretAccessKey: 'test',
					},
				}),
			},
		},
		browserOrNode() {
			return {
				isBrowser: true,
				isNode: false,
			};
		},
	};
});

describe('WebSocket Health Monitoring', () => {
	let provider: AWSAppSyncRealTimeProvider;
	let fakeWebSocketInterface: FakeWebSocketInterface;

	beforeEach(() => {
		provider = new AWSAppSyncRealTimeProvider();
		fakeWebSocketInterface = new FakeWebSocketInterface();
		mockStorage.clear();

		// Mock the WebSocket creation
		jest.spyOn(provider as any, '_getNewWebSocket').mockImplementation(() => {
			fakeWebSocketInterface.webSocket.readyState = WebSocket.CONNECTING;
			return fakeWebSocketInterface.webSocket as unknown as WebSocket;
		});
	});

	afterEach(() => {
		fakeWebSocketInterface.teardown();
		jest.clearAllMocks();
	});

	describe('getConnectionHealth', () => {
		test('returns healthy state when connected with recent keep-alive', () => {
			// Simulate connected state with recent keep-alive
			(provider as any).connectionState = CS.Connected;
			(provider as any).keepAliveTimestamp = Date.now();

			// Get health state
			const health = (provider as any).getConnectionHealth();

			expect(health.isHealthy).toBe(true);
			expect(health.connectionState).toBe(CS.Connected);
			expect(health.lastKeepAliveTime).toBeGreaterThan(0);
			expect(health.timeSinceLastKeepAlive).toBeLessThan(1000);
		});

		test('returns unhealthy state when not connected', () => {
			const health = (provider as any).getConnectionHealth();

			expect(health.isHealthy).toBe(false);
			expect(health.connectionState).toBe(CS.Disconnected);
			expect(health.lastKeepAliveTime).toBeGreaterThan(0); // Will have initial timestamp
			expect(typeof health.timeSinceLastKeepAlive).toBe('number');
		});

		test('returns unhealthy state when keep-alive is stale (>65 seconds)', () => {
			// Simulate connected state with old keep-alive (66 seconds ago)
			(provider as any).connectionState = CS.Connected;
			(provider as any).keepAliveTimestamp = Date.now() - 66000;

			const health = (provider as any).getConnectionHealth();

			expect(health.isHealthy).toBe(false);
			expect(health.connectionState).toBe(CS.Connected);
			expect(health.timeSinceLastKeepAlive).toBeGreaterThan(65000);
		});
	});

	describe('getPersistentConnectionHealth', () => {
		test('returns health state using in-memory keep-alive when no persistent data', async () => {
			// Simulate connected state with recent keep-alive
			(provider as any).connectionState = CS.Connected;
			(provider as any).keepAliveTimestamp = Date.now();

			const health = await (provider as any).getPersistentConnectionHealth();

			expect(health.isHealthy).toBe(true);
			expect(health.connectionState).toBe(CS.Connected);
			expect(health.lastKeepAliveTime).toBeGreaterThan(0);
			expect(health.timeSinceLastKeepAlive).toBeLessThan(1000);
		});

		test('uses more recent timestamp between in-memory and persistent storage', async () => {
			const now = Date.now();
			const olderTime = now - 10000; // 10 seconds ago

			// Set older persistent time
			mockStorage.data.set('AWS_AMPLIFY_LAST_KEEP_ALIVE', `${olderTime}`);

			// Set newer in-memory time
			(provider as any).connectionState = CS.Connected;
			(provider as any).keepAliveTimestamp = now;

			const health = await (provider as any).getPersistentConnectionHealth();

			// Should use the more recent in-memory timestamp, not the older persistent one
			expect(health.lastKeepAliveTime).toBeGreaterThan(olderTime);
			expect(health.timeSinceLastKeepAlive).toBeLessThan(1000);
		});

		test('returns Infinity for timeSinceLastKeepAlive when no keep-alive received', async () => {
			// Clear any existing data
			mockStorage.data.clear();

			// Create new provider instance to ensure no in-memory keep-alive
			const newProvider = new AWSAppSyncRealTimeProvider();

			// Set keep-alive timestamp to 0 to simulate never received
			(newProvider as any).keepAliveTimestamp = 0;

			const health = await (newProvider as any).getPersistentConnectionHealth();

			expect(health.lastKeepAliveTime).toBe(0);
			expect(health.timeSinceLastKeepAlive).toBe(Infinity);
			expect(health.isHealthy).toBe(false);
		});

		test('persists keep-alive timestamp to storage', async () => {
			const timestamp = Date.now();

			// Call the persist method directly
			await (provider as any).persistKeepAliveTimestamp(timestamp);

			// Wait a bit for async storage operations
			await new Promise(resolve => setTimeout(resolve, 100));

			expect(mockStorage.setItem).toHaveBeenCalled();
			const storedValue = mockStorage.data.get('AWS_AMPLIFY_LAST_KEEP_ALIVE');
			expect(storedValue).toBeTruthy();
			expect(Number(storedValue)).toBe(timestamp);
		});
	});

	describe('isConnected', () => {
		test('returns true when WebSocket readyState is OPEN', () => {
			// Mock WebSocket as OPEN
			(provider as any).awsRealTimeSocket = {
				readyState: WebSocket.OPEN,
			};

			expect((provider as any).isConnected()).toBe(true);
		});

		test('returns false when WebSocket readyState is not OPEN', () => {
			expect((provider as any).isConnected()).toBe(false);
		});

		test('returns false when WebSocket is CONNECTING', () => {
			// Mock WebSocket as CONNECTING
			(provider as any).awsRealTimeSocket = {
				readyState: WebSocket.CONNECTING,
			};

			expect((provider as any).isConnected()).toBe(false);
		});

		test('returns false when WebSocket is CLOSED', () => {
			// Mock WebSocket as CLOSED
			(provider as any).awsRealTimeSocket = {
				readyState: WebSocket.CLOSED,
			};

			expect((provider as any).isConnected()).toBe(false);
		});

		test('returns false when WebSocket is undefined', () => {
			(provider as any).awsRealTimeSocket = undefined;

			expect((provider as any).isConnected()).toBe(false);
		});
	});

	describe('reconnect', () => {
		test('successfully initiates reconnection when not connected', async () => {
			// Mock close to resolve immediately
			jest.spyOn(provider as any, 'close').mockResolvedValue(undefined);

			// Reconnect should succeed
			await expect((provider as any).reconnect()).resolves.toBeUndefined();
		});

		test('throws error when reconnection is already in progress', async () => {
			// Mock close to take some time
			jest
				.spyOn(provider as any, 'close')
				.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

			// Start first reconnection (don't await)
			const reconnectPromise1 = (provider as any).reconnect();

			// Try concurrent reconnection immediately - should throw
			await expect((provider as any).reconnect()).rejects.toThrow(
				'Reconnection already in progress',
			);

			// Wait for first reconnection to complete
			await reconnectPromise1;
		});

		test(
			'allows reconnection after previous attempt completes',
			async () => {
				// Mock close to resolve immediately
				jest.spyOn(provider as any, 'close').mockResolvedValue(undefined);

				// First reconnection
				await (provider as any).reconnect();

				// Wait for the reconnection flag to reset (1 second timeout)
				await new Promise(resolve => setTimeout(resolve, 1100));

				// Second reconnection should succeed
				await expect((provider as any).reconnect()).resolves.toBeUndefined();
			},
			15000,
		); // Increase timeout to 15 seconds

		test('closes existing connection before reconnecting when connected', async () => {
			// Mock WebSocket as connected
			(provider as any).awsRealTimeSocket = {
				readyState: WebSocket.OPEN,
			};

			const closeSpy = jest
				.spyOn(provider as any, 'close')
				.mockResolvedValue(undefined);

			await (provider as any).reconnect();

			expect(closeSpy).toHaveBeenCalled();
		});

		test('does not call close when not connected', async () => {
			// Ensure WebSocket is not connected
			(provider as any).awsRealTimeSocket = undefined;

			const closeSpy = jest
				.spyOn(provider as any, 'close')
				.mockResolvedValue(undefined);

			await (provider as any).reconnect();

			expect(closeSpy).not.toHaveBeenCalled();
		});

		test('triggers reconnection monitor', async () => {
			jest.spyOn(provider as any, 'close').mockResolvedValue(undefined);

			const recordSpy = jest.spyOn(
				(provider as any).reconnectionMonitor,
				'record',
			);

			await (provider as any).reconnect();

			expect(recordSpy).toHaveBeenCalled();
		});
	});

	describe('Error handling', () => {
		test('getPersistedKeepAliveTimestamp handles storage errors gracefully', async () => {
			// Mock storage to throw error
			mockStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

			const timestamp = await (
				provider as any
			).getPersistedKeepAliveTimestamp();

			expect(timestamp).toBe(0);
		});

		test('persistKeepAliveTimestamp handles storage errors gracefully', async () => {
			// Mock storage to throw error
			mockStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

			// Should not throw
			await expect(
				(provider as any).persistKeepAliveTimestamp(Date.now()),
			).resolves.toBeUndefined();
		});

		test('getPersistentConnectionHealth handles invalid stored values', async () => {
			// Create a fresh provider and reset keepAliveTimestamp
			const freshProvider = new AWSAppSyncRealTimeProvider();
			(freshProvider as any).keepAliveTimestamp = 0;

			// Store invalid value
			mockStorage.data.set('AWS_AMPLIFY_LAST_KEEP_ALIVE', 'invalid');

			const health = await (
				freshProvider as any
			).getPersistentConnectionHealth();

			// Should return valid health state with 0 timestamp (invalid converts to 0)
			expect(health).toHaveProperty('isHealthy');
			expect(health).toHaveProperty('connectionState');
			expect(health.lastKeepAliveTime).toBe(0);
		});
	});
});

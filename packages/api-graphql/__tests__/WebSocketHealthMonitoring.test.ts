import { AWSAppSyncRealTimeProvider } from '../src/Providers/AWSAppSyncRealTimeProvider';
import { ConnectionState as CS } from '../src/types/PubSub';

describe('WebSocket Health Monitoring', () => {
	let provider: AWSAppSyncRealTimeProvider;

	beforeEach(() => {
		provider = new AWSAppSyncRealTimeProvider();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('getConnectionHealth', () => {
		test('returns healthy when connected with recent keep-alive', () => {
			(provider as any).connectionState = CS.Connected;
			(provider as any).keepAliveTimestamp = Date.now();

			const health = provider.getConnectionHealth();

			expect(health.isHealthy).toBe(true);
			expect(health.connectionState).toBe(CS.Connected);
			expect(health.lastKeepAliveTime).toBeGreaterThan(0);
			expect(health.timeSinceLastKeepAlive).toBeLessThan(1000);
		});

		test('returns unhealthy when not connected', () => {
			(provider as any).connectionState = CS.Disconnected;
			(provider as any).keepAliveTimestamp = Date.now();

			const health = provider.getConnectionHealth();

			expect(health.isHealthy).toBe(false);
			expect(health.connectionState).toBe(CS.Disconnected);
		});

		test('returns unhealthy when keep-alive is stale (>65s)', () => {
			(provider as any).connectionState = CS.Connected;
			(provider as any).keepAliveTimestamp = Date.now() - 66_000;

			const health = provider.getConnectionHealth();

			expect(health.isHealthy).toBe(false);
			expect(health.connectionState).toBe(CS.Connected);
			expect(health.timeSinceLastKeepAlive).toBeGreaterThan(65_000);
		});

		test('returns unhealthy during connection disruption', () => {
			(provider as any).connectionState = CS.ConnectionDisrupted;
			(provider as any).keepAliveTimestamp = Date.now();

			const health = provider.getConnectionHealth();

			expect(health.isHealthy).toBe(false);
			expect(health.connectionState).toBe(CS.ConnectionDisrupted);
		});

		test('defaults connectionState to Disconnected when undefined', () => {
			(provider as any).connectionState = undefined;

			const health = provider.getConnectionHealth();

			expect(health.connectionState).toBe(CS.Disconnected);
		});
	});

	describe('isConnected', () => {
		test('returns true when WebSocket readyState is OPEN', () => {
			(provider as any).awsRealTimeSocket = {
				readyState: WebSocket.OPEN,
			};

			expect(provider.isConnected()).toBe(true);
		});

		test('returns false when WebSocket is undefined', () => {
			(provider as any).awsRealTimeSocket = undefined;

			expect(provider.isConnected()).toBe(false);
		});

		test('returns false when WebSocket is CONNECTING', () => {
			(provider as any).awsRealTimeSocket = {
				readyState: WebSocket.CONNECTING,
			};

			expect(provider.isConnected()).toBe(false);
		});

		test('returns false when WebSocket is CLOSED', () => {
			(provider as any).awsRealTimeSocket = {
				readyState: WebSocket.CLOSED,
			};

			expect(provider.isConnected()).toBe(false);
		});

		test('returns false when WebSocket is CLOSING', () => {
			(provider as any).awsRealTimeSocket = {
				readyState: WebSocket.CLOSING,
			};

			expect(provider.isConnected()).toBe(false);
		});
	});
});

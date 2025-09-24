// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';

import { ConnectionHealthMonitor } from '../../src/utils/ConnectionHealthMonitor';

jest.mock('@aws-amplify/core');

describe('ConnectionHealthMonitor', () => {
	let monitor: ConnectionHealthMonitor;
	let hubDispatchSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		monitor = new ConnectionHealthMonitor();
		hubDispatchSpy = jest.spyOn(Hub, 'dispatch');
	});

	afterEach(() => {
		monitor.reset();
		jest.useRealTimers();
	});

	describe('recordKeepAlive', () => {
		it('should update last keep-alive timestamp', () => {
			const beforeTime = Date.now();
			monitor.recordKeepAlive();
			const afterTime = Date.now();

			const lastKeepAlive = monitor.getLastKeepAlive();
			expect(lastKeepAlive).not.toBeNull();
			expect(lastKeepAlive!.getTime()).toBeGreaterThanOrEqual(beforeTime);
			expect(lastKeepAlive!.getTime()).toBeLessThanOrEqual(afterTime);
		});

		it('should increment keepAlivesReceived counter', () => {
			monitor.recordKeepAlive();
			monitor.recordKeepAlive();
			monitor.recordKeepAlive();

			const metrics = monitor.getMetrics();
			expect(metrics.keepAlivesReceived).toBe(3);
		});

		it('should reset keepAlivesMissed counter', () => {
			monitor.recordKeepAliveMissed();
			monitor.recordKeepAliveMissed();
			expect(monitor.getMetrics().keepAlivesMissed).toBe(2);

			monitor.recordKeepAlive();
			expect(monitor.getMetrics().keepAlivesMissed).toBe(0);
		});

		it('should dispatch Hub event', () => {
			monitor.recordKeepAlive();

			expect(hubDispatchSpy).toHaveBeenCalledWith('api', {
				event: 'WebsocketHealthEvent',
				data: expect.objectContaining({
					type: 'keepAlive',
					timestamp: expect.any(Date),
					metrics: expect.objectContaining({
						lastKeepAliveAt: expect.any(Date),
						keepAlivesReceived: 1,
					}),
				}),
			});
		});

		it('should notify listeners', () => {
			const listener1 = jest.fn();
			const listener2 = jest.fn();

			monitor.onKeepAlive(listener1);
			monitor.onKeepAlive(listener2);

			monitor.recordKeepAlive();

			expect(listener1).toHaveBeenCalledWith(expect.any(Date));
			expect(listener2).toHaveBeenCalledWith(expect.any(Date));
		});
	});

	describe('recordConnectionEstablished', () => {
		it('should set connection start time', () => {
			monitor.recordConnectionEstablished();

			const metrics = monitor.getMetrics();
			expect(metrics.connectionStartedAt).not.toBeNull();
		});

		it('should reset counters', () => {
			monitor.recordKeepAlive();
			monitor.recordKeepAlive();
			monitor.recordKeepAliveMissed();

			monitor.recordConnectionEstablished();

			const metrics = monitor.getMetrics();
			expect(metrics.keepAlivesReceived).toBe(0);
			expect(metrics.keepAlivesMissed).toBe(0);
			expect(metrics.lastKeepAliveAt).toBeNull();
		});

		it('should dispatch Hub event', () => {
			monitor.recordConnectionEstablished();

			expect(hubDispatchSpy).toHaveBeenCalledWith('api', {
				event: 'WebsocketHealthEvent',
				data: {
					type: 'connectionEstablished',
					timestamp: expect.any(Date),
				},
			});
		});
	});

	describe('isHealthy', () => {
		it('should return false when no keep-alive received', () => {
			expect(monitor.isHealthy()).toBe(false);
		});

		it('should return true when keep-alive is recent', () => {
			monitor.recordKeepAlive();
			expect(monitor.isHealthy()).toBe(true);
		});

		it('should return false when keep-alive is stale', () => {
			monitor.recordKeepAlive();

			// Advance time past the default 30s threshold
			jest.advanceTimersByTime(31000);

			expect(monitor.isHealthy()).toBe(false);
		});

		it('should respect custom threshold', () => {
			monitor.recordKeepAlive();

			// Advance time to 5 seconds
			jest.advanceTimersByTime(5000);

			// Should be unhealthy with 3s threshold
			expect(monitor.isHealthy(3000)).toBe(false);

			// Should be healthy with 10s threshold
			expect(monitor.isHealthy(10000)).toBe(true);
		});
	});

	describe('onKeepAlive', () => {
		it('should return unsubscribe function', () => {
			const listener = jest.fn();
			const unsubscribe = monitor.onKeepAlive(listener);

			monitor.recordKeepAlive();
			expect(listener).toHaveBeenCalledTimes(1);

			unsubscribe();

			monitor.recordKeepAlive();
			expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
		});
	});

	describe('startHealthCheck', () => {
		it('should call onUnhealthy when connection becomes unhealthy', () => {
			const onUnhealthy = jest.fn();

			monitor.recordKeepAlive();

			// Advance time to make connection unhealthy
			jest.advanceTimersByTime(31000);

			// Start health check after connection is already unhealthy
			monitor.startHealthCheck(10000, onUnhealthy);

			// Health check hasn't run yet
			expect(onUnhealthy).not.toHaveBeenCalled();

			// Advance to trigger health check
			jest.advanceTimersByTime(10000);

			expect(onUnhealthy).toHaveBeenCalledTimes(1);
		});

		it('should record missed keep-alives', () => {
			monitor.recordKeepAlive();
			monitor.startHealthCheck(5000);

			// Advance past health threshold and trigger check
			jest.advanceTimersByTime(36000);

			const metrics = monitor.getMetrics();
			expect(metrics.keepAlivesMissed).toBe(1);
		});

		it('should stop previous health check when starting new one', () => {
			const onUnhealthy1 = jest.fn();
			const onUnhealthy2 = jest.fn();

			monitor.recordKeepAlive();

			// Start first health check with 5s interval
			monitor.startHealthCheck(5000, onUnhealthy1);

			// Advance 3 seconds (not enough to trigger first check)
			jest.advanceTimersByTime(3000);

			// Start second health check (cancels first)
			monitor.startHealthCheck(15000, onUnhealthy2);

			// Advance past first check interval
			jest.advanceTimersByTime(5000);

			// First callback should not be called (was cancelled)
			expect(onUnhealthy1).not.toHaveBeenCalled();

			// Make connection unhealthy
			jest.advanceTimersByTime(23000); // Total 31s since keep-alive

			// Advance to trigger second health check (15s interval)
			jest.advanceTimersByTime(7000); // Total 15s since second check started

			// Second callback should be called once
			expect(onUnhealthy2).toHaveBeenCalledTimes(1);
		});
	});

	describe('getMetrics', () => {
		it('should return comprehensive metrics', () => {
			monitor.recordConnectionEstablished();
			monitor.recordKeepAlive();
			monitor.recordKeepAlive();
			monitor.recordKeepAliveMissed();

			const metrics = monitor.getMetrics();

			expect(metrics).toEqual({
				lastKeepAliveAt: expect.any(Date),
				connectionStartedAt: expect.any(Date),
				keepAlivesReceived: 2,
				keepAlivesMissed: 1,
				isHealthy: true,
			});
		});
	});

	describe('reset', () => {
		it('should clear all state', () => {
			const listener = jest.fn();
			const onUnhealthy = jest.fn();

			monitor.recordConnectionEstablished();
			monitor.recordKeepAlive();
			monitor.recordKeepAliveMissed();
			monitor.onKeepAlive(listener);
			monitor.startHealthCheck(5000, onUnhealthy);

			monitor.reset();

			const metrics = monitor.getMetrics();
			expect(metrics).toEqual({
				lastKeepAliveAt: null,
				connectionStartedAt: null,
				keepAlivesReceived: 0,
				keepAlivesMissed: 0,
				isHealthy: false,
			});

			// Verify health check stopped
			jest.advanceTimersByTime(40000);
			expect(onUnhealthy).not.toHaveBeenCalled();

			// Verify listeners cleared
			monitor.recordKeepAlive();
			expect(listener).not.toHaveBeenCalled();
		});
	});
});

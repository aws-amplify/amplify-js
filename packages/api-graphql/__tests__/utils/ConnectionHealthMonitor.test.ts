// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';

import {
	ConnectionHealthMonitor,
	HEALTH_EVENT,
} from '../../src/utils/ConnectionHealthMonitor';

jest.mock('@aws-amplify/core');

describe('ConnectionHealthMonitor', () => {
	let monitor: ConnectionHealthMonitor;
	let loggerDebugSpy: jest.SpyInstance;
	let loggerInfoSpy: jest.SpyInstance;
	let loggerWarnSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		jest.useFakeTimers();

		loggerDebugSpy = jest
			.spyOn(ConsoleLogger.prototype, 'debug')
			.mockImplementation();
		loggerInfoSpy = jest
			.spyOn(ConsoleLogger.prototype, 'info')
			.mockImplementation();
		loggerWarnSpy = jest
			.spyOn(ConsoleLogger.prototype, 'warn')
			.mockImplementation();

		monitor = new ConnectionHealthMonitor();
	});

	afterEach(() => {
		monitor.close();
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	describe('recordKeepAlive', () => {
		it('should update last keep-alive timestamp', () => {
			monitor.recordConnectionEstablished();
			const beforeTime = Date.now();
			monitor.recordKeepAlive();

			const state = monitor.getHealthState();
			expect(state.lastKeepAliveTime).toBeDefined();
			expect(state.lastKeepAliveTime).toBeGreaterThanOrEqual(beforeTime);
		});

		it('should increment totalKeepAlivesReceived counter', () => {
			monitor.recordConnectionEstablished();
			monitor.recordKeepAlive();
			monitor.recordKeepAlive();
			monitor.recordKeepAlive();

			const state = monitor.getHealthState();
			expect(state.totalKeepAlivesReceived).toBe(3);
		});

		it('should reset consecutiveMissedKeepAlives counter', () => {
			monitor.recordConnectionEstablished();
			// Force unhealthy state
			jest.advanceTimersByTime(35000);
			const unhealthyState = monitor.getHealthState();
			expect(unhealthyState.consecutiveMissedKeepAlives).toBeGreaterThan(0);

			monitor.recordKeepAlive();
			const state = monitor.getHealthState();
			expect(state.consecutiveMissedKeepAlives).toBe(0);
		});

		it('should log keep-alive receipt', () => {
			monitor.recordKeepAlive();

			expect(loggerDebugSpy).toHaveBeenCalledWith(
				HEALTH_EVENT.KEEP_ALIVE_RECEIVED,
			);
		});

		it('should notify observers', done => {
			const observable = monitor.getHealthStateObservable();
			expect(observable).toBeDefined();

			const subscription = observable!.subscribe(state => {
				if (state.totalKeepAlivesReceived > 0) {
					expect(state.isHealthy).toBe(true);
					expect(state.lastKeepAliveTime).toBeDefined();
					subscription.unsubscribe();
					done();
				}
			});

			monitor.recordKeepAlive();
		});
	});

	describe('recordConnectionEstablished', () => {
		it('should set connection start time', () => {
			monitor.recordConnectionEstablished();

			const state = monitor.getHealthState();
			expect(state.connectionStartTime).toBeDefined();
			expect(state.isHealthy).toBe(true);
		});

		it('should reset counters', () => {
			monitor.recordConnectionEstablished();
			monitor.recordKeepAlive();
			monitor.recordKeepAlive();

			// Re-establish connection
			monitor.recordConnectionEstablished();

			const state = monitor.getHealthState();
			expect(state.totalKeepAlivesReceived).toBe(0);
			expect(state.consecutiveMissedKeepAlives).toBe(0);
		});

		it('should log connection establishment', () => {
			monitor.recordConnectionEstablished();

			expect(loggerDebugSpy).toHaveBeenCalledWith(
				HEALTH_EVENT.CONNECTION_ESTABLISHED,
			);
		});
	});

	describe('isHealthy', () => {
		it('should return false when no keep-alive received', () => {
			expect(monitor.isHealthy()).toBe(false);
		});

		it('should return true when keep-alive is recent', () => {
			monitor.recordConnectionEstablished();
			monitor.recordKeepAlive();
			expect(monitor.isHealthy()).toBe(true);
		});

		it('should return false when keep-alive is stale', () => {
			monitor.recordConnectionEstablished();
			monitor.recordKeepAlive();

			// Advance time past the default 30s threshold
			jest.advanceTimersByTime(31000);

			expect(monitor.isHealthy()).toBe(false);
		});
	});

	describe('getHealthStateObservable', () => {
		it('should emit state changes', done => {
			const states: boolean[] = [];
			const observable = monitor.getHealthStateObservable();

			const subscription = observable.subscribe(state => {
				states.push(state.isHealthy);

				// BehaviorSubject emits initial state, then updates
				if (states.length === 3) {
					expect(states).toEqual([false, true, true]); // initial, connected, keep-alive
					subscription.unsubscribe();
					done();
				}
			});

			monitor.recordConnectionEstablished();
			monitor.recordKeepAlive();
		});

		it('should handle constructor validation', () => {
			expect(() => new ConnectionHealthMonitor('test', 0, 1000)).toThrow(
				'healthCheckThresholdMs must be positive',
			);
			expect(() => new ConnectionHealthMonitor('test', 1000, 0)).toThrow(
				'healthCheckIntervalMs must be positive',
			);
			expect(() => new ConnectionHealthMonitor('test', 1000, 2000)).toThrow(
				'healthCheckIntervalMs must be less than healthCheckThresholdMs',
			);
		});
	});

	describe('health check timer', () => {
		it('should detect unhealthy connection', () => {
			monitor.recordConnectionEstablished();
			monitor.recordKeepAlive();

			// Advance past health threshold
			jest.advanceTimersByTime(31000);

			// Trigger health check
			jest.advanceTimersByTime(5000);

			const state = monitor.getHealthState();
			expect(state.isHealthy).toBe(false);
			expect(state.consecutiveMissedKeepAlives).toBeGreaterThan(0);
		});

		it('should log when connection becomes unhealthy', () => {
			monitor.recordConnectionEstablished();
			monitor.recordKeepAlive();

			// Advance to make unhealthy and trigger check
			jest.advanceTimersByTime(36000);

			expect(loggerWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining(HEALTH_EVENT.KEEP_ALIVE_MISSED),
			);
		});
	});

	describe('getHealthState', () => {
		it('should return comprehensive health state', () => {
			monitor.recordConnectionEstablished();
			monitor.recordKeepAlive();
			monitor.recordKeepAlive();

			const state = monitor.getHealthState();

			expect(state).toEqual({
				isHealthy: true,
				lastKeepAliveTime: expect.any(Number),
				connectionStartTime: expect.any(Number),
				totalKeepAlivesReceived: 2,
				consecutiveMissedKeepAlives: 0,
			});
		});
	});

	describe('close', () => {
		it('should clear all state and complete observables', () => {
			let completed = false;
			const observable = monitor.getHealthStateObservable();

			const subscription = observable!.subscribe({
				next: () => {},
				complete: () => {
					completed = true;
				},
			});

			monitor.recordConnectionEstablished();
			monitor.recordKeepAlive();

			monitor.close();

			const state = monitor.getHealthState();
			expect(state).toEqual({
				isHealthy: false,
				lastKeepAliveTime: undefined,
				connectionStartTime: undefined,
				totalKeepAlivesReceived: 0,
				consecutiveMissedKeepAlives: 0,
			});

			expect(completed).toBe(true);
			subscription.unsubscribe();
		});
	});
});

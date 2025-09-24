// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface ConnectionHealthState {
	isHealthy: boolean;
	lastKeepAliveTime?: number;
	connectionStartTime?: number;
	consecutiveMissedKeepAlives: number;
	totalKeepAlivesReceived: number;
}

export enum HEALTH_EVENT {
	CONNECTION_ESTABLISHED = 'Connection established',
	KEEP_ALIVE_RECEIVED = 'Keep-alive received',
	KEEP_ALIVE_MISSED = 'Keep-alive missed',
	CONNECTION_UNHEALTHY = 'Connection unhealthy',
}

/**
 * Monitors WebSocket connection health by tracking keep-alive messages.
 * Follows Amplify patterns for observables and logging.
 */
export class ConnectionHealthMonitor {
	private readonly logger: ConsoleLogger;
	private readonly destroy$ = new Subject<void>();
	private readonly healthStateSubject: BehaviorSubject<ConnectionHealthState>;
	public readonly healthState$: Observable<ConnectionHealthState>;
	private healthCheckTimer?: ReturnType<typeof setTimeout>;
	private readonly healthCheckThresholdMs: number;
	private readonly healthCheckIntervalMs: number;
	private isActive = true;

	constructor(
		loggerName = 'ConnectionHealthMonitor',
		healthCheckThresholdMs = 30000,
		healthCheckIntervalMs = 5000,
	) {
		// Validate inputs
		if (healthCheckThresholdMs <= 0) {
			throw new Error('healthCheckThresholdMs must be positive');
		}
		if (healthCheckIntervalMs <= 0) {
			throw new Error('healthCheckIntervalMs must be positive');
		}
		if (healthCheckIntervalMs >= healthCheckThresholdMs) {
			throw new Error(
				'healthCheckIntervalMs must be less than healthCheckThresholdMs',
			);
		}

		this.logger = new ConsoleLogger(loggerName);
		this.healthCheckThresholdMs = healthCheckThresholdMs;
		this.healthCheckIntervalMs = healthCheckIntervalMs;

		const initialState: ConnectionHealthState = {
			isHealthy: false,
			consecutiveMissedKeepAlives: 0,
			totalKeepAlivesReceived: 0,
		};

		this.healthStateSubject = new BehaviorSubject(initialState);
		this.healthState$ = this.healthStateSubject
			.asObservable()
			.pipe(takeUntil(this.destroy$));
	}

	/**
	 * Records a keep-alive message receipt
	 */
	recordKeepAlive(): void {
		if (!this.isActive) {
			return;
		}

		try {
			const currentTime = Date.now();
			this.logger.debug(HEALTH_EVENT.KEEP_ALIVE_RECEIVED);

			const currentState = this.healthStateSubject.getValue();
			const previouslyUnhealthy = !currentState.isHealthy;

			const newState: ConnectionHealthState = {
				...currentState,
				lastKeepAliveTime: currentTime,
				isHealthy: true,
				consecutiveMissedKeepAlives: 0,
				totalKeepAlivesReceived: currentState.totalKeepAlivesReceived + 1,
			};

			this.healthStateSubject.next(newState);

			if (previouslyUnhealthy) {
				this.logger.info('WebSocket connection recovered');
			}

			// Reset health check timer
			this.scheduleNextHealthCheck();
		} catch (error) {
			this.logger.error('Error in recordKeepAlive:', error);
		}
	}

	/**
	 * Records connection establishment
	 */
	recordConnectionEstablished(): void {
		if (!this.isActive) {
			return;
		}

		try {
			const currentTime = Date.now();
			this.logger.debug(HEALTH_EVENT.CONNECTION_ESTABLISHED);

			const newState: ConnectionHealthState = {
				isHealthy: true,
				connectionStartTime: currentTime,
				lastKeepAliveTime: currentTime,
				consecutiveMissedKeepAlives: 0,
				totalKeepAlivesReceived: 0,
			};

			this.healthStateSubject.next(newState);
			this.scheduleNextHealthCheck();
		} catch (error) {
			this.logger.error('Error in recordConnectionEstablished:', error);
		}
	}

	/**
	 * Records a missed keep-alive
	 */
	private recordKeepAliveMissed(): void {
		if (!this.isActive) {
			return;
		}

		try {
			const currentState = this.healthStateSubject.getValue();
			const wasHealthy = currentState.isHealthy;

			// Cap consecutive misses at a reasonable number
			const newConsecutiveMisses = Math.min(
				currentState.consecutiveMissedKeepAlives + 1,
				100,
			);

			const newState: ConnectionHealthState = {
				...currentState,
				isHealthy: false,
				consecutiveMissedKeepAlives: newConsecutiveMisses,
			};

			this.healthStateSubject.next(newState);

			if (wasHealthy) {
				this.logger.warn(
					`${HEALTH_EVENT.KEEP_ALIVE_MISSED} - WebSocket may be unhealthy`,
				);
			}
		} catch (error) {
			this.logger.error('Error in recordKeepAliveMissed:', error);
		}
	}

	/**
	 * Gets the current health state
	 * @returns A copy of the current health state
	 */
	getHealthState(): ConnectionHealthState {
		return { ...this.healthStateSubject.getValue() };
	}

	/**
	 * Checks if the connection is currently healthy
	 * @returns true if the connection is healthy, false otherwise
	 */
	isHealthy(): boolean {
		const state = this.healthStateSubject.getValue();
		if (!state.lastKeepAliveTime) {
			return false;
		}

		const timeSinceLastKeepAlive = Date.now() - state.lastKeepAliveTime;

		return timeSinceLastKeepAlive < this.healthCheckThresholdMs;
	}

	/**
	 * Returns an observable for monitoring health state changes
	 * @returns Observable that emits health state changes
	 */
	getHealthStateObservable(): Observable<ConnectionHealthState> {
		return this.healthState$;
	}

	/**
	 * Schedules the next health check
	 */
	private scheduleNextHealthCheck(): void {
		if (!this.isActive) {
			return;
		}

		this.stopHealthCheck();

		this.healthCheckTimer = setTimeout(() => {
			if (!this.isActive) {
				return;
			}

			try {
				const state = this.healthStateSubject.getValue();
				if (state.lastKeepAliveTime) {
					const timeSinceLastKeepAlive = Date.now() - state.lastKeepAliveTime;

					if (timeSinceLastKeepAlive >= this.healthCheckThresholdMs) {
						this.recordKeepAliveMissed();
					}
				}

				// Schedule next check only if still active
				if (this.isActive) {
					this.scheduleNextHealthCheck();
				}
			} catch (error) {
				this.logger.error('Error in health check:', error);
			}
		}, this.healthCheckIntervalMs);
	}

	/**
	 * Stops the health check timer
	 */
	private stopHealthCheck(): void {
		if (this.healthCheckTimer) {
			clearTimeout(this.healthCheckTimer);
			this.healthCheckTimer = undefined;
		}
	}

	/**
	 * Closes the monitor and cleans up resources
	 */
	close(): void {
		if (!this.isActive) {
			return; // Already closed
		}

		this.logger.debug('Closing ConnectionHealthMonitor');

		this.isActive = false;
		this.stopHealthCheck();

		// Emit final state
		const finalState: ConnectionHealthState = {
			isHealthy: false,
			consecutiveMissedKeepAlives: 0,
			totalKeepAlivesReceived: 0,
		};
		this.healthStateSubject.next(finalState);

		// Complete subjects
		this.destroy$.next();
		this.destroy$.complete();
		this.healthStateSubject.complete();
	}
}

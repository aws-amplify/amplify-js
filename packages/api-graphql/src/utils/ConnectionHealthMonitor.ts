// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConsoleLogger } from '@aws-amplify/core';
import { Observable, Observer } from 'rxjs';

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
	private _healthState: ConnectionHealthState;
	private _healthStateObservable?: Observable<ConnectionHealthState>;
	private _healthStateObserver?: Observer<ConnectionHealthState>;
	private healthCheckTimer?: ReturnType<typeof setTimeout>;
	private readonly healthCheckThresholdMs: number;
	private readonly healthCheckIntervalMs: number;

	constructor(
		loggerName = 'ConnectionHealthMonitor',
		healthCheckThresholdMs = 30000,
		healthCheckIntervalMs = 5000,
	) {
		this.logger = new ConsoleLogger(loggerName);
		this.healthCheckThresholdMs = healthCheckThresholdMs;
		this.healthCheckIntervalMs = healthCheckIntervalMs;

		this._healthState = {
			isHealthy: false,
			consecutiveMissedKeepAlives: 0,
			totalKeepAlivesReceived: 0,
		};

		this._healthStateObservable = new Observable(observer => {
			this._healthStateObserver = observer;

			return () => {
				this.stopHealthCheck();
				this._healthStateObserver = undefined;
			};
		});
	}

	/**
	 * Records a keep-alive message receipt
	 */
	recordKeepAlive(): void {
		const currentTime = Date.now();

		this.logger.debug(HEALTH_EVENT.KEEP_ALIVE_RECEIVED);

		const previouslyUnhealthy = !this._healthState.isHealthy;

		this._healthState = {
			...this._healthState,
			lastKeepAliveTime: currentTime,
			isHealthy: true,
			consecutiveMissedKeepAlives: 0,
			totalKeepAlivesReceived: this._healthState.totalKeepAlivesReceived + 1,
		};

		this.notifyObservers();

		if (previouslyUnhealthy) {
			this.logger.info('WebSocket connection recovered');
		}

		// Reset health check timer
		this.scheduleNextHealthCheck();
	}

	/**
	 * Records connection establishment
	 */
	recordConnectionEstablished(): void {
		const currentTime = Date.now();

		this.logger.debug(HEALTH_EVENT.CONNECTION_ESTABLISHED);

		this._healthState = {
			isHealthy: true,
			connectionStartTime: currentTime,
			lastKeepAliveTime: currentTime,
			consecutiveMissedKeepAlives: 0,
			totalKeepAlivesReceived: 0,
		};

		this.notifyObservers();
		this.scheduleNextHealthCheck();
	}

	/**
	 * Records a missed keep-alive
	 */
	private recordKeepAliveMissed(): void {
		const wasHealthy = this._healthState.isHealthy;

		this._healthState = {
			...this._healthState,
			isHealthy: false,
			consecutiveMissedKeepAlives:
				this._healthState.consecutiveMissedKeepAlives + 1,
		};

		if (wasHealthy) {
			this.logger.warn(
				`${HEALTH_EVENT.KEEP_ALIVE_MISSED} - WebSocket may be unhealthy`,
			);
		}

		this.notifyObservers();
	}

	/**
	 * Gets the current health state
	 */
	getHealthState(): ConnectionHealthState {
		return { ...this._healthState };
	}

	/**
	 * Checks if the connection is currently healthy
	 */
	isHealthy(): boolean {
		if (!this._healthState.lastKeepAliveTime) {
			return false;
		}

		const timeSinceLastKeepAlive =
			Date.now() - this._healthState.lastKeepAliveTime;

		return timeSinceLastKeepAlive < this.healthCheckThresholdMs;
	}

	/**
	 * Returns an observable for monitoring health state changes
	 */
	getHealthStateObservable(): Observable<ConnectionHealthState> | undefined {
		return this._healthStateObservable;
	}

	/**
	 * Notifies observers of state changes
	 */
	private notifyObservers(): void {
		if (this._healthStateObserver) {
			this._healthStateObserver.next({ ...this._healthState });
		}
	}

	/**
	 * Schedules the next health check
	 */
	private scheduleNextHealthCheck(): void {
		this.stopHealthCheck();

		this.healthCheckTimer = setTimeout(() => {
			if (this._healthState.lastKeepAliveTime) {
				const timeSinceLastKeepAlive =
					Date.now() - this._healthState.lastKeepAliveTime;

				if (timeSinceLastKeepAlive >= this.healthCheckThresholdMs) {
					this.recordKeepAliveMissed();
				}
			}

			// Schedule next check
			this.scheduleNextHealthCheck();
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
	 * Resets the monitor state and closes observers
	 */
	close(): void {
		this.logger.debug('Closing ConnectionHealthMonitor');

		this.stopHealthCheck();

		if (this._healthStateObserver) {
			this._healthStateObserver.complete();
			this._healthStateObserver = undefined;
		}

		this._healthState = {
			isHealthy: false,
			consecutiveMissedKeepAlives: 0,
			totalKeepAlivesReceived: 0,
		};
	}
}

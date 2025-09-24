// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Hub } from '@aws-amplify/core';

export interface ConnectionHealthMetrics {
	lastKeepAliveAt: Date | null;
	connectionStartedAt: Date | null;
	keepAlivesMissed: number;
	keepAlivesReceived: number;
	isHealthy: boolean;
}

export type KeepAliveListener = (timestamp: Date) => void;

/**
 * Monitors WebSocket connection health by tracking keep-alive messages.
 * Provides APIs to check connection health and subscribe to keep-alive events.
 */
export class ConnectionHealthMonitor {
	private lastKeepAlive: Date | null = null;
	private connectionStartedAt: Date | null = null;
	private keepAlivesMissed = 0;
	private keepAlivesReceived = 0;
	private keepAliveListeners = new Set<KeepAliveListener>();
	private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
	private readonly healthCheckThreshold: number;

	constructor(healthCheckThreshold = 30000) {
		this.healthCheckThreshold = healthCheckThreshold;
	}

	/**
	 * Records a keep-alive message receipt
	 */
	recordKeepAlive(): void {
		const now = new Date();
		this.lastKeepAlive = now;
		this.keepAlivesReceived++;
		this.keepAlivesMissed = 0;

		// Notify listeners
		this.keepAliveListeners.forEach(listener => {
			listener(now);
		});

		// Dispatch Hub event
		Hub.dispatch('api', {
			event: 'WebsocketHealthEvent',
			data: {
				type: 'keepAlive',
				timestamp: now,
				metrics: this.getMetrics(),
			},
		});
	}

	/**
	 * Records connection establishment
	 */
	recordConnectionEstablished(): void {
		this.connectionStartedAt = new Date();
		this.lastKeepAlive = null;
		this.keepAlivesReceived = 0;
		this.keepAlivesMissed = 0;

		Hub.dispatch('api', {
			event: 'WebsocketHealthEvent',
			data: {
				type: 'connectionEstablished',
				timestamp: this.connectionStartedAt,
			},
		});
	}

	/**
	 * Records a missed keep-alive
	 */
	recordKeepAliveMissed(): void {
		this.keepAlivesMissed++;

		Hub.dispatch('api', {
			event: 'WebsocketHealthEvent',
			data: {
				type: 'keepAliveMissed',
				missedCount: this.keepAlivesMissed,
				metrics: this.getMetrics(),
			},
		});
	}

	/**
	 * Gets the last keep-alive timestamp
	 */
	getLastKeepAlive(): Date | null {
		return this.lastKeepAlive;
	}

	/**
	 * Checks if the connection is healthy based on keep-alive recency
	 */
	isHealthy(threshold?: number): boolean {
		if (!this.lastKeepAlive) {
			return false;
		}

		const actualThreshold = threshold ?? this.healthCheckThreshold;

		return Date.now() - this.lastKeepAlive.getTime() < actualThreshold;
	}

	/**
	 * Gets comprehensive connection health metrics
	 */
	getMetrics(): ConnectionHealthMetrics {
		return {
			lastKeepAliveAt: this.lastKeepAlive,
			connectionStartedAt: this.connectionStartedAt,
			keepAlivesMissed: this.keepAlivesMissed,
			keepAlivesReceived: this.keepAlivesReceived,
			isHealthy: this.isHealthy(),
		};
	}

	/**
	 * Subscribes to keep-alive events
	 * @returns Unsubscribe function
	 */

	onKeepAlive(callback: KeepAliveListener): () => void {
		this.keepAliveListeners.add(callback);

		return () => this.keepAliveListeners.delete(callback);
	}

	/**
	 * Starts automatic health checking
	 */

	startHealthCheck(interval = 10000, onUnhealthy?: () => void): void {
		this.stopHealthCheck();

		this.healthCheckInterval = setInterval(() => {
			if (!this.isHealthy()) {
				if (this.keepAlivesMissed === 0) {
					// Only record first miss to avoid multiple increments
					this.recordKeepAliveMissed();
				}
				onUnhealthy?.();
			}
		}, interval);
	}

	/**
	 * Stops automatic health checking
	 */
	stopHealthCheck(): void {
		if (this.healthCheckInterval) {
			clearInterval(this.healthCheckInterval);
			this.healthCheckInterval = null;
		}
	}

	/**
	 * Resets the monitor state
	 */
	reset(): void {
		this.stopHealthCheck();
		this.lastKeepAlive = null;
		this.connectionStartedAt = null;
		this.keepAlivesReceived = 0;
		this.keepAlivesMissed = 0;
		this.keepAliveListeners.clear();
	}
}

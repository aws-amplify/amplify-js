// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { Observer } from 'rxjs';

import { RECONNECT_DELAY, RECONNECT_INTERVAL } from '../Providers/constants';

export enum ReconnectEvent {
	START_RECONNECT = 'START_RECONNECT',
	HALT_RECONNECT = 'HALT_RECONNECT',
}

/**
 * Captures the reconnect event logic used to determine when to reconnect to PubSub providers.
 *   Reconnnect attempts are delayed by 5 seconds to let the interface settle.
 *   Attempting to reconnect only once creates unrecoverable states when the network state isn't
 *   supported by the browser, so this keeps retrying every minute until halted.
 */
export class ReconnectionMonitor {
	private reconnectObservers: Observer<void>[] = [];
	private reconnectIntervalId?: ReturnType<typeof setInterval>;
	private reconnectSetTimeoutId?: ReturnType<typeof setTimeout>;

	/**
	 * Add reconnect observer to the list of observers to alert on reconnect
	 */
	addObserver(reconnectObserver: Observer<void>) {
		this.reconnectObservers.push(reconnectObserver);
	}

	/**
	 * Given a reconnect event, start the appropriate behavior
	 */
	record(event: ReconnectEvent) {
		if (event === ReconnectEvent.START_RECONNECT) {
			// If the reconnection hasn't been started
			if (
				this.reconnectSetTimeoutId === undefined &&
				this.reconnectIntervalId === undefined
			) {
				this.reconnectSetTimeoutId = setTimeout(() => {
					// Reconnect now
					this._triggerReconnect();
					// Retry reconnect every periodically until it works
					this.reconnectIntervalId = setInterval(() => {
						this._triggerReconnect();
					}, RECONNECT_INTERVAL);
				}, RECONNECT_DELAY);
			}
		}

		if (event === ReconnectEvent.HALT_RECONNECT) {
			if (this.reconnectIntervalId) {
				clearInterval(this.reconnectIntervalId);
				this.reconnectIntervalId = undefined;
			}
			if (this.reconnectSetTimeoutId) {
				clearTimeout(this.reconnectSetTimeoutId);
				this.reconnectSetTimeoutId = undefined;
			}
		}
	}

	/**
	 * Complete all reconnect observers
	 */
	close() {
		this.reconnectObservers.forEach(reconnectObserver => {
			reconnectObserver.complete?.();
		});
	}

	private _triggerReconnect() {
		this.reconnectObservers.forEach(reconnectObserver => {
			reconnectObserver.next?.();
		});
	}
}
